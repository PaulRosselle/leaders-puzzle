import type { IGameListener } from "./IGameListener";
import type { Action } from "./entities/actions/Action";
import { ActionHandler } from "./entities/actions/ActionHandler";
import { GameHistory } from "./entities/actions/GameHistory";
import type { Character } from "./entities/core/Character";
import { ActionBuilder } from "./entities/interactions/ActionBuilder";
import { InteractionContext } from "./entities/interactions/InteractionContext";
import { InteractionRequest } from "./entities/interactions/InteractionRequest";
import type { InteractionResult } from "./entities/interactions/InteractionResult";
import { InteractionTarget } from "./entities/interactions/InteractionTarget";
import { Game } from "./entities/projection/Game";
import { GameCancelledError } from "./entities/states/GameCancelledError";
import { GameContext } from "./entities/states/GameContext";
import { GameEndedError } from "./entities/states/GameEndedError";
import { InteractionRequestType } from "./enums/interactions/InteractionRequestType";
import { InteractionResultType } from "./enums/interactions/InteractionResultType";
import { InteractionTargetType } from "./enums/interactions/InteractionTargetType";
import { ActionResolverFactory } from "./factories/ActionResolverFactory";
import { GameFactory } from "./factories/GameFactory";
import { BoardQuery } from "./queries/BoardQuery";
import { GameQuery } from "./queries/GameQuery";
import { PlayabilityQuery } from "./queries/PlayabilityQuery";

/**
 * Runs the game logic.
 *
 * Owns the mutable game state and talks to the outside world exclusively
 * through an IGameListener. Simplified version: the main loop only runs
 * the actions phase.
 */
export class GameHandler {
    private readonly game: Game;
    private readonly gameHistory: GameHistory;
    private readonly listener: IGameListener;

    private started = false;
    private stopped = false;

    public constructor(gameHistory: GameHistory, listener: IGameListener) {
        this.game = GameFactory.create(gameHistory);
        this.gameHistory = GameHistory.copy(gameHistory);
        this.listener = listener;
    }

    /**
     * Requests a stop. The loop unwinds at its next checkpoint, or immediately
     * when the controller rejects the interaction the loop is waiting for.
     */
    public stop(): void {
        this.stopped = true;
    }

    private checkStopped(): void {
        if (this.stopped) {
            throw new GameCancelledError();
        }
    }

    /**
     * Returns a snapshot of the current game context.
     */
    private getCurrentContext(): GameContext {
        return new GameContext(this.game, this.gameHistory);
    }

    /**
     * Runs the game until it ends or the handler is stopped.
     * A handler instance can only be run once.
     *
     * The returned promise is rejected only for unexpected failures:
     * stop requests and game endings are handled internally.
     */
    public async runAsync(): Promise<void> {
        if (this.started) {
            throw new Error("GameHandler already running");
        }
        this.started = true;

        try {
            this.checkStopped();
            await this.listener.onGameStarted(this.getCurrentContext());

            // Main loop only exits through GameEndedError or GameCancelledError.
            while (true) {
                this.checkStopped();
                await this.runActionsPhaseAsync();
            }
        } catch (error) {
            if (error instanceof GameCancelledError) {
                return;
            }
            if (error instanceof GameEndedError) {
                await this.notifyGameEnded(error.playerWon);
                return;
            }
            throw error;
        }
    }

    private async notifyGameEnded(playerWon: boolean): Promise<void> {
        try {
            await this.listener.onGameEnded(this.getCurrentContext(), playerWon);
        } catch (error) {
            // Stopped while the listener was handling the end of the game.
            if (!(error instanceof GameCancelledError)) {
                throw error;
            }
        }
    }

    /**
     * Runs one step of the actions phase: checks for a winner, asks which
     * character to play, then plays it or undoes the last action.
     */
    private async runActionsPhaseAsync(): Promise<void> {
        this.checkGameEnded();

        const result = await this.selectPlayableCharacterAsync();

        switch (result.getResultType()) {
            case InteractionResultType.PositionChosen:
                await this.playCharacterAsync(this.getPlayableCharacterFromResult(result));
                break;
            case InteractionResultType.UndoLastAction:
                await this.undoLastActionAsync();
                break;
            default:
                throw new Error(
                    `Invalid interaction result: illegal type "${InteractionResultType[result.getResultType()]}" for actions phase`
                );
        }
    }

    private selectPlayableCharacterAsync(): Promise<InteractionResult> {
        const playableCharacterPositions = PlayabilityQuery.getPlayableCharacterPositions(this.game, this.gameHistory);

        const legalTargets = playableCharacterPositions.map(position =>
            new InteractionTarget(InteractionTargetType.PlayableCharacterPosition, position)
        );

        const legalResults = [InteractionResultType.PositionChosen];

        if (this.gameHistory.actions.length > 0) {
            legalResults.push(InteractionResultType.UndoLastAction);
        }

        return this.requestInputAsync(new InteractionRequest(
            InteractionRequestType.PlayableCharacterExpected,
            new InteractionContext(),
            legalTargets,
            legalResults
        ));
    }

    /**
     * Resolves and executes the action of the selected character by requesting
     * the required inputs until the action is complete or cancelled.
     * A cancelled action is never applied to the game.
     */
    private async playCharacterAsync(playableCharacter: Character): Promise<void> {
        const builder = new ActionBuilder(playableCharacter);
        const resolver = ActionResolverFactory.create(this.game, this.gameHistory, playableCharacter);

        while (true) {
            this.checkStopped();

            if (builder.isBuildCancelled()) {
                return;
            }

            const request = resolver.getNextInteraction(builder);

            // No further input is required: build and execute the action.
            if (request === null) {
                this.doAction(resolver.buildAction(builder));
                return;
            }

            builder.addResult(await this.requestInputAsync(request));

            const feedback = resolver.getNextFeedback(builder);
            if (feedback !== null) {
                builder.addFeedback(feedback);
                await this.listener.onFeedback(this.getCurrentContext(), feedback);
            }
        }
    }

    /**
     * Requests an input, then checks that the game was not stopped meanwhile
     * and that the answer satisfies the request contract.
     */
    private async requestInputAsync(request: InteractionRequest): Promise<InteractionResult> {
        this.checkStopped();

        const result = await this.listener.onInputRequired(this.getCurrentContext(), request);

        // An answer arriving after stop() must never be acted upon.
        this.checkStopped();

        if (!request.getLegalResults().includes(result.getResultType())) {
            throw new Error(`Illegal interaction result "${InteractionResultType[result.getResultType()]}"`);
        }

        const target = result.getChosenTarget();
        if (target !== null && !request.getLegalTargets().some(legalTarget => legalTarget.equals(target))) {
            throw new Error(`Illegal interaction target: ${target}`);
        }

        return result;
    }

    /**
     * Applies the action to the game and records it in the history.
     */
    private doAction(action: Action): void {
        new ActionHandler(this.game, action).doAction();
        this.gameHistory.actions.push(action);

        // Every action is a game state change that may trigger the victory condition.
        this.checkGameEnded();
    }

    private async undoLastActionAsync(): Promise<void> {
        const lastAction = this.gameHistory.actions.pop();
        if (lastAction === undefined) {
            throw new Error("Cannot undo an action when no action was done");
        }

        new ActionHandler(this.game, lastAction).undoAction();

        await this.listener.onActionUndone(this.getCurrentContext());
    }

    private checkGameEnded(): void {
        const winnerTeam = GameQuery.getWinnerTeam(this.game);

        if (winnerTeam !== null) {
            throw new GameEndedError(winnerTeam === GameQuery.getPlayerTeam());
        }
    }

    private getPlayableCharacterFromResult(result: InteractionResult): Character {
        const target = result.getNonNullChosenTarget();

        if (target.getTargetType() !== InteractionTargetType.PlayableCharacterPosition) {
            throw new Error("Invalid interaction result: playable character missing");
        }
        
        return BoardQuery.getNonNullCharacterAt(this.game.board, target.getChosenPosition());
    }
}