
import { Action } from "../entities/actions/Action";
import { ActionMotion } from "../entities/actions/ActionMotion";
import { ActionBuilder } from "../entities/interactions/ActionBuilder";
import { InteractionContext } from "../entities/interactions/InteractionContext";
import { InteractionFeedback } from "../entities/interactions/InteractionFeedback";
import { InteractionRequest } from "../entities/interactions/InteractionRequest";
import { InteractionResult } from "../entities/interactions/InteractionResult";
import { InteractionTarget } from "../entities/interactions/InteractionTarget";
import { Character } from "../entities/core/Character";
import { CharacterPath } from "../entities/core/CharacterPath";
import { Position } from "../entities/core/Position";
import { Game } from "../entities/projection/Game";
import { GameHistory } from "../entities/actions/GameHistory";

import { ActionMotionType } from "../enums/ActionMotionType";
import { InteractionTargetType } from "../enums/interactions/InteractionTargetType";

import { BoardQuery } from "../queries/BoardQuery";
import { AbilityQuery } from "../queries/AbilityQuery";
import { GameQuery } from "../queries/GameQuery";
import { ResolverQuery } from "../queries/ResolverQuery";

import { ActionHandler } from "../entities/actions/ActionHandler";

/**
 * Base class responsible for resolving the interaction flow required
 * to build and validate an Action.
 *
 * A resolver defines how a character action is progressively constructed
 * through player interactions. Implementations may override
 * getNextInteraction() to provide custom interaction flows depending
 * on the character abilities and action rules.
 */
export class CharacterActionResolver {
    protected readonly game: Game;
    protected readonly gameHistory: GameHistory;

    protected readonly character: Character;
    protected readonly characterPos: Position;

    /**
     * Creates a resolver for a specific character in a given game context.
     *
     * @param game current game state used to evaluate and simulate actions
     * @param gameHistory history of previous game events and actions
     * @param character character whose action is being resolved
     */
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        this.game = game;
        this.gameHistory = gameHistory;
        this.character = character;

        this.characterPos = BoardQuery.getPositionByCharacterId(
            game.getBoard(),
            character.id
        ).position;
    }

    /**
     * Checks whether an action can legally be performed in the current game state.
     *
     * The action is temporarily applied to the current game projection
     * in order to evaluate the resulting state. The projection is then
     * restored regardless of the validation result.
     *
     * An action is considered invalid if it results in the capture or
     * the surrounding of the acting team's leader.
     */
    protected isActionValid(action: Action): boolean {
        const team = this.character.team;

        // Apply the action temporarily to evaluate its consequences.
        const actionHandler = new ActionHandler(this.game, action);

        try {
            actionHandler.doAction();

            return (
                !GameQuery.isLeaderCaptured(this.game, team) &&
                !GameQuery.isLeaderSurrounded(this.game, team)
            );
        } finally {
            // Always restore the original game projection.
            actionHandler.undoAction();
        }
    }

    /**
     * Checks whether the action obtained by adding a candidate result
     * and its feedback to the given builder can legally be performed.
     *
     * The reference builder is left unchanged: the candidate is added to a copy.
     */
    protected isValidWith(refBuilder: ActionBuilder, result: InteractionResult, feedback: InteractionFeedback): boolean {
        const builder = ActionBuilder.copy(refBuilder);

        builder.addResult(result);
        builder.addFeedback(feedback);

        return this.isActionValid(this.buildAction(builder));
    }

    /**
     * Computes all destinations reachable through a normal movement action
     * and removes those that would result in an invalid game state.
     */
    protected getNormalMovementValidDestinations(builder: ActionBuilder): Position[] {
        const destinations: Position[] = [];

        const paths = AbilityQuery.getNormalMovementPaths(this.game, this.character);

        for (const path of paths) {
            const destPos = path.getDestination();

            // Create the candidate interaction result.
            const movementResult = ResolverQuery.createPositionResult(
                new InteractionContext(this.character),
                InteractionTargetType.MovementDestination,
                destPos
            );

            // Create the corresponding movement feedback.
            const movementFeedback = ResolverQuery.createSingleMotionFeedback(
                ActionMotionType.Move,
                this.character,
                this.characterPos,
                destPos
            );

            if (this.isValidWith(builder, movementResult, movementFeedback)) {
                destinations.push(destPos);
            }
        }

        return destinations;
    }

    /**
     * Retrieves the next interaction required to continue building a character action.
     *
     * The default implementation provides normal movement behavior:
     * the player must select a valid destination position.
     */
    public getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        // The default movement action only requires one interaction.
        if (builder.getResults().length > 0) {
            return null;
        }

        const legalTargets: InteractionTarget[] = [];

        ResolverQuery.addTargets(
            legalTargets,
            InteractionTargetType.MovementDestination,
            this.getNormalMovementValidDestinations(builder)
        );

        return ResolverQuery.createPositionRequest(new InteractionContext(this.character), legalTargets);
    }

    /**
     * Returns the next feedback generated from the current interaction state.
     *
     * The default movement action only requires a single interaction.
     */
    public getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        if (builder.getResults().length !== 1 ||
            builder.getFeedbacks().length !== 0 ||
            builder.isBuildCancelled()) {
            return null;
        }

        const result = builder.getResults()[0];

        if (!this.isNormalMovementResult(result)) {
            throw new Error("The default action resolver only handles normal movement");
        }

        const paths = AbilityQuery.getNormalMovementPaths(this.game, this.character);
        return this.buildNormalMovementFeedback(this.getPathMatchingResult(result, paths));
    }

    /**
     * Builds the final action represented by the current interaction state.
     */
    public buildAction(builder: ActionBuilder): Action {
        const motions: ActionMotion[] = [];

        for (const feedback of builder.getFeedbacks()) {
            motions.push(...feedback.getActionsMotions());
        }

        return new Action(builder.getSourceCharacter(), motions);
    }

    /**
     * Returns the shortest path matching the selected destination.
     *
     * @throws Error if no matching path is found.
     */
    protected getPathMatchingResult(result: InteractionResult, paths: readonly CharacterPath[]): CharacterPath {
        const destPos = ResolverQuery.getChosenPosition(result);

        let bestMatchingPath: CharacterPath | null = null;

        for (const path of paths) {
            if (path.getDestination().equals(destPos) &&
                (bestMatchingPath === null ||
                 bestMatchingPath.getPositions().length > path.getPositions().length)) {
                bestMatchingPath = path;
            }
        }

        if (bestMatchingPath === null) {
            throw new Error(`No path found matching result: ${result}`);
        }

        return bestMatchingPath;
    }

    /**
     * Builds the feedback corresponding to a normal movement path.
     */
    protected buildNormalMovementFeedback(path: CharacterPath): InteractionFeedback {
        return ResolverQuery.createPathFeedback(this.character, path, ActionMotionType.Move);
    }

    /**
     * Checks whether a result represents a normal movement destination.
     */
    protected isNormalMovementResult(result: InteractionResult): boolean {
        return ResolverQuery.isValidResult(result, InteractionTargetType.MovementDestination);
    }

    /**
     * Checks whether a result represents the selection of an active ability target.
     */
    protected isAbilityTargetResult(result: InteractionResult): boolean {
        return ResolverQuery.isValidResult(result, InteractionTargetType.ActiveAbilityTargetPosition);
    }

    /**
     * Checks whether a result represents the selection of an active ability destination.
     */
    protected isAbilityDestinationResult(result: InteractionResult): boolean {
        return ResolverQuery.isValidResult(result, InteractionTargetType.ActiveAbilityDestination);
    }

    /**
     * Returns a copy of the builder containing the selection of an active ability target.
     *
     * If the builder already contains a result, the target is assumed
     * to have been selected and the copy is returned unchanged.
     */
    protected withAbilityTargetSelected(builder: ActionBuilder, targetPos: Position): ActionBuilder {
        const targetBuilder = ActionBuilder.copy(builder);

        if (targetBuilder.getResults().length === 0) {
            targetBuilder.addResult(
                ResolverQuery.createPositionResult(
                    new InteractionContext(this.character),
                    InteractionTargetType.ActiveAbilityTargetPosition,
                    targetPos
                )
            );
        }

        return targetBuilder;
    }

    /**
     * Returns the character standing on a cell.
     *
     * @throws Error if the cell is empty.
     */
    protected getCharacterAt(position: Position): Character {
        const character = this.game.getBoard().getCell(position).getCharacter();

        if (character === null) {
            throw new Error(`No character at position ${position.toString()}`);
        }

        return character;
    }
}