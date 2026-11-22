import { GameCancelledError } from "../gamelogic/entities/states/GameCancelledError";
import { GameHandler } from "../gamelogic/GameHandler";
import type { IGameListener } from "../gamelogic/IGameListener";
import type { GameHistory } from "../gamelogic/entities/actions/GameHistory";
import type { GameContext } from "../gamelogic/entities/states/GameContext";
import type { InteractionFeedback } from "../gamelogic/entities/interactions/InteractionFeedback";
import type { InteractionRequest } from "../gamelogic/entities/interactions/InteractionRequest";
import { InteractionResult } from "../gamelogic/entities/interactions/InteractionResult";
import type { InteractionTarget } from "../gamelogic/entities/interactions/InteractionTarget";
import type { Game } from "../gamelogic/entities/projection/Game";
import { InteractionResultType } from "../gamelogic/enums/interactions/InteractionResultType";

/**
 * Builds the immutable context handed to the UI from snapshots of the game.
 * Injected so that the controller makes no assumption about GameContext.
 */
export type GameContextFactory = (game: Game, history: GameHistory) => GameContext;

export interface InteractionCompletion {
    /** Idempotent: only the first call has an effect. */
    complete(): void;
}

export interface GameControllerListener {
    onGameStarted(): void;
    onGameEnded(playerWon: boolean): void;
    onActionUndone(): void;
    onInteractionRequired(request: InteractionRequest): void;
    /** Called when the pending request is answered or discarded (stop). */
    onInteractionCleared(): void;
    /** The game flow resumes once completion.complete() is called. */
    onFeedback(feedback: InteractionFeedback, completion: InteractionCompletion): void;
    /** Unexpected failure of the game loop. */
    onError(error: unknown): void;
}

interface PendingInteraction {
    readonly request: InteractionRequest;
    readonly resolve: (result: InteractionResult) => void;
    readonly reject: (reason: unknown) => void;
}

/**
 * State of one game execution. Everything a run waits for lives here, so a
 * stale run can never affect a newer one.
 */
class ActiveRun {
    public handler: GameHandler | null = null;
    public pending: PendingInteraction | null = null;
    public pendingFeedbackReject: ((reason: unknown) => void) | null = null;
    public cancelled = false;
}

/**
 * Orchestrates a GameHandler: starts and stops it, and bridges its
 * asynchronous interaction requests with the outside world.
 * Contains no game logic and never touches the game state.
 */
export class GameController {
    private readonly listener: GameControllerListener;

    private run: ActiveRun | null = null;
    private runPromise: Promise<void> = Promise.resolve();
    private latestContext: GameContext | null = null;
    private disposed = false;

    public constructor(listener: GameControllerListener) {
        this.listener = listener;
    }

    /**
     * Starts a new game loop.
     *
     * @throws Error if a loop is already running (or stopping) or the controller is disposed.
     */
    public startGame(gameHistory: GameHistory): void {
        if (this.disposed) {
            throw new Error("Controller is disposed");
        }
        if (this.run !== null) {
            throw new Error("A game is already running");
        }

        const run = new ActiveRun();
        this.run = run;

        const handler = new GameHandler(gameHistory, this.createGameListener(run));
        run.handler = handler;

        this.runPromise = this.executeRun(run, handler);
    }

    /**
     * Stops the current game, including while it waits for an answer.
     * Resolves once the game loop has fully unwound.
     */
    public async stopGame(): Promise<void> {
        const run = this.run;
        if (run === null) {
            return;
        }

        run.handler?.stop();
        this.cancelOutstanding(run);
        await this.runPromise;
    }

    public async restartGame(gameHistory: GameHistory): Promise<void> {
        await this.stopGame();
        this.startGame(gameHistory);
    }

    public async dispose(): Promise<void> {
        this.disposed = true;
        await this.stopGame();
    }

    /**
     * Resolves (never rejects) when the current run is over.
     */
    public whenFinished(): Promise<void> {
        return this.runPromise;
    }

    public isGameRunning(): boolean {
        return this.run !== null;
    }

    /**
     * Last immutable snapshot received from the game handler.
     */
    public getCurrentContext(): GameContext {
        if (this.latestContext === null) {
            throw new Error("No game in progress");
        }
        return this.latestContext;
    }

    public isRequestPending(request: InteractionRequest): boolean {
        return this.run?.pending?.request === request;
    }

    public canUndoLastAction(): boolean {
        return this.hasLegalResult(InteractionResultType.UndoLastAction);
    }

    /**
     * Answers a request with one of its legal targets.
     *
     * @returns false if the request is no longer pending (late or duplicate answer: ignored)
     * @throws Error if the target is not legal for the request
     */
    public selectTarget(request: InteractionRequest, target: InteractionTarget): boolean {
        const legalTarget = request.getLegalTargets().find(candidate => candidate.equals(target));
        if (legalTarget === undefined) {
            throw new Error(`Invalid target: ${target}`);
        }

        return this.respond(request, new InteractionResult(
            InteractionResultType.PositionChosen,
            request.getContext(),
            legalTarget
        ));
    }

    public cancelAction(request: InteractionRequest): boolean {
        return this.respondWithType(request, InteractionResultType.CancelAction);
    }

    public undoLastAction(request: InteractionRequest): boolean {
        return this.respondWithType(request, InteractionResultType.UndoLastAction);
    }

    private hasLegalResult(type: InteractionResultType): boolean {
        return this.run?.pending?.request.getLegalResults().includes(type) ?? false;
    }

    private respondWithType(request: InteractionRequest, resultType: InteractionResultType): boolean {
        return this.respond(request, new InteractionResult(resultType, request.getContext(), null));
    }

    private respond(request: InteractionRequest, result: InteractionResult): boolean {
        const run = this.run;
        const pending = run?.pending;
        if (run === null || pending === null || pending === undefined || pending.request !== request) {
            return false;
        }
        if (!request.getLegalResults().includes(result.getResultType())) {
            throw new Error(`Illegal result "${InteractionResultType[result.getResultType()]}" for this request`);
        }

        // Clearing synchronously guarantees that a request is resolved at most once.
        run.pending = null;
        try {
            this.listener.onInteractionCleared();
        } finally {
            pending.resolve(result);
        }
        return true;
    }

    private async executeRun(run: ActiveRun, handler: GameHandler): Promise<void> {
        let failure: { error: unknown } | null = null;

        try {
            await handler.runAsync();
        } catch (error) {
            failure = { error };
        }

        // Cleanup first, so that listeners can restart a game from their callbacks.
        this.cancelOutstanding(run);
        if (this.run === run) {
            this.run = null;
        }

        if (failure !== null) {
            try {
                this.listener.onError(failure.error);
            } catch (listenerError) {
                console.error("GameController listener failed", listenerError);
            }
        }
    }

    /**
     * Rejects whatever the handler is currently waiting for. Idempotent.
     */
    private cancelOutstanding(run: ActiveRun): void {
        run.cancelled = true;

        const pending = run.pending;
        if (pending !== null) {
            run.pending = null;
            try {
                this.listener.onInteractionCleared();
            } catch (error) {
                console.error("GameController listener failed", error);
            }
            pending.reject(new GameCancelledError());
        }

        const rejectFeedback = run.pendingFeedbackReject;
        if (rejectFeedback !== null) {
            run.pendingFeedbackReject = null;
            rejectFeedback(new GameCancelledError());
        }
    }

    private assertCurrent(run: ActiveRun): void {
        if (run.cancelled || this.run !== run) {
            throw new GameCancelledError();
        }
    }

    /**
     * Listener given to one specific handler: calls coming from a stale run are refused.
     */
    private createGameListener(run: ActiveRun): IGameListener {
        return {
            onGameStarted: async (gameContext) => {
                this.assertCurrent(run);
                this.latestContext = gameContext;
                this.listener.onGameStarted();
            },

            onGameEnded: async (gameContext, playerWon) => {
                this.assertCurrent(run);
                this.latestContext = gameContext;
                this.listener.onGameEnded(playerWon);
            },

            onActionUndone: async (gameContext) => {
                this.assertCurrent(run);
                this.latestContext = gameContext;
                this.listener.onActionUndone();
            },

            onInputRequired: (gameContext, request) => new Promise<InteractionResult>((resolve, reject) => {
                this.assertCurrent(run);
                if (run.pending !== null) {
                    throw new Error("An interaction is already pending");
                }

                this.latestContext = gameContext;
                run.pending = { request, resolve, reject };
                try {
                    this.listener.onInteractionRequired(request);
                } catch (error) {
                    run.pending = null;
                    reject(error);
                }
            }),

            onFeedback: (gameContext, feedback) => new Promise<void>((resolve, reject) => {
                this.assertCurrent(run);

                this.latestContext = gameContext;
                let done = false;
                const complete = (): void => {
                    if (done) {
                        return;
                    }
                    done = true;
                    run.pendingFeedbackReject = null;
                    resolve();
                };

                run.pendingFeedbackReject = reject;
                try {
                    this.listener.onFeedback(feedback, { complete });
                } catch (error) {
                    done = true;
                    run.pendingFeedbackReject = null;
                    reject(error);
                }
            }),
        };
    }
}