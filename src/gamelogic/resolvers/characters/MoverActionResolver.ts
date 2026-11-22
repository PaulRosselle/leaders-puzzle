import type { Character } from "../../entities/core/Character";
import type { Position } from "../../entities/core/Position";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import type { ActionBuilder } from "../../entities/interactions/ActionBuilder";
import { InteractionContext } from "../../entities/interactions/InteractionContext";
import type { InteractionFeedback } from "../../entities/interactions/InteractionFeedback";
import type { InteractionRequest } from "../../entities/interactions/InteractionRequest";
import type { InteractionResult } from "../../entities/interactions/InteractionResult";
import type { InteractionTarget } from "../../entities/interactions/InteractionTarget";
import { ActionMotionType } from "../../enums/ActionMotionType";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";
import { AbilityQuery } from "../../queries/AbilityQuery";
import { BoardQuery } from "../../queries/BoardQuery";
import { ResolverQuery } from "../../queries/ResolverQuery";
import { ActionResolver } from "../ActionResolver";

/**
 * Base archetype for characters able to move other characters as an Active Ability.
 */
export abstract class MoverActionResolver extends ActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    protected getTargetMovementMaxDistance(): number {
        // The default Mover behavior is to move the target by one cell
        return 1;
    }

    protected abstract getTargetPositions(): Position[];

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        if (builder.getResults().length === 0) {
            return this.buildInitialInteraction(builder);
        }

        if (builder.isBuildCancelled()) {
            return null;
        }

        const firstResult = builder.getResults()[0];

        // If the first interaction was a normal movement
        if (this.isNormalMovementResult(firstResult)) {
            return super.getNextInteraction(builder);
        }

        // Otherwise it should be an ability activation, in which case the next (and last)
        // interaction is to select a target destination
        if (this.isAbilityTargetResult(firstResult)) {
            if (builder.getResults().length > 1) {
                if (!this.isAbilityDestinationResult(builder.getResults()[1])) {
                    throw new Error("Invalid result type for a Mover ability activation");
                }
                return null;
            }

            return this.buildTargetDestinationInteraction(builder, firstResult);
        }

        throw new Error("Invalid Mover action builder");
    }

    public override getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        // Mover actions generate a single feedback.
        if (!ResolverQuery.isFeedbackExpected(builder)) {
            return null;
        }

        const firstResult = builder.getResults()[0];

        // A normal movement only requires the first interaction, so its feedback
        // can be generated directly by the default resolver.
        if (this.isNormalMovementResult(firstResult)) {
            return super.getNextFeedback(builder);
        }

        // An ability activation requires two interactions: the selected target
        // and the destination to which that target should be moved.
        if (builder.getResults().length < 2) {
            return null;
        }

        const targetDestResult = builder.getResults()[1];

        if (!this.isAbilityTargetResult(firstResult) ||
            !this.isAbilityDestinationResult(targetDestResult)) {
            throw new Error("Invalid result type for a Mover ability activation");
        }

        const targetOrigin = ResolverQuery.getChosenPosition(firstResult);
        const target = this.getCharacterAt(targetOrigin);
        const targetDest = ResolverQuery.getChosenPosition(targetDestResult);

        return ResolverQuery.createSingleMotionFeedback(
            ActionMotionType.Move, target, targetOrigin, targetDest
        );
    }

    /**
     * Builds the first interaction of the action.
     *
     * The player can either choose a normal movement destination for the
     * Mover or select a valid target.
     */
    private buildInitialInteraction(builder: ActionBuilder): InteractionRequest {
        const legalTargets: InteractionTarget[] = [];

        // A Mover ability target characters. Therefore, its target positions cannot overlap with
        // the normal movement positions which requires empty cells
        ResolverQuery.addTargets(
            legalTargets,
            InteractionTargetType.MovementDestination,
            this.getNormalMovementValidDestinations(builder)
        );

        if (this.canUseActiveAbility()) {
            for (const targetPos of this.getTargetPositions()) {
                if (this.getValidTargetDestinations(builder, targetPos, true).length > 0) {
                    ResolverQuery.addTargets(
                        legalTargets,
                        InteractionTargetType.ActiveAbilityTargetPosition,
                        [targetPos]
                    );
                }
            }
        }

        return ResolverQuery.createPositionRequest(new InteractionContext(this.character), legalTargets);
    }

    protected canUseActiveAbility(): boolean {
        return AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character);
    }

    /**
     * Builds an interaction request for selecting a destination for the targeted character.
     *
     * @throws Error if the result does not contain a selected target position
     */
    private buildTargetDestinationInteraction(builder: ActionBuilder,
                                              result: InteractionResult): InteractionRequest {
        if (!this.isAbilityTargetResult(result)) {
            throw new Error("A target position must be transmitted through a PositionChosen InteractionResult");
        }

        const targetPos = ResolverQuery.getChosenPosition(result);

        const legalTargets: InteractionTarget[] = [];
        ResolverQuery.addTargets(
            legalTargets,
            InteractionTargetType.ActiveAbilityDestination,
            this.getValidTargetDestinations(builder, targetPos, false)
        );

        const targetedCharacter = this.getCharacterAt(targetPos);
        return ResolverQuery.createPositionRequest(
            new InteractionContext(this.character, targetedCharacter),
            legalTargets
        );
    }

    /**
     * Gets the valid destination positions for the targeted character.
     *
     * @param builder the action builder
     * @param targetPos the position of the targeted character
     * @param exitAfterFirstValidDest whether to stop after finding the first valid destination
     */
    protected getValidTargetDestinations(builder: ActionBuilder,
                                         targetPos: Position,
                                         exitAfterFirstValidDest: boolean): Position[] {
        const target = this.getCharacterAt(targetPos);

        const destinations: Position[] = [];

        const targetBuilder = this.withAbilityTargetSelected(builder, targetPos);

        for (const destinationCell of BoardQuery.findEmptyCellsAround(
            this.game.getBoard(), targetPos, this.getTargetMovementMaxDistance()
        )) {
            const destination = destinationCell.getPosition();

            const destinationResult = ResolverQuery.createPositionResult(
                new InteractionContext(this.character, target),
                InteractionTargetType.ActiveAbilityDestination,
                destination
            );
            const destinationFeedback = ResolverQuery.createSingleMotionFeedback(
                ActionMotionType.Move, target, targetPos, destination
            );

            if (this.isValidWith(targetBuilder, destinationResult, destinationFeedback)) {
                destinations.push(destination);

                if (exitAfterFirstValidDest) {
                    return destinations;
                }
            }
        }

        return destinations;
    }
}
