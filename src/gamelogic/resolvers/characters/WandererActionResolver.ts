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
 * Resolves the Wanderer's active ability.
 *
 * The Wanderer can move to any empty cell that is not adjacent to an enemy.
 *
 * The destination is selected directly by the player through a single
 * interaction. The selected destination is then used to build the movement
 * feedback.
 */
export class WandererActionResolver extends ActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        // Wanderer actions require a single interaction.
        // If an interaction has already been selected, no further interaction can be added to this action.
        if (builder.getResults().length > 0) {
            return null;
        }

        const legalTargets: InteractionTarget[] = [];

        // Normal movement and Wanderer destinations may overlap. We give priority to movement
        // meaning a cell reachable via normal movement won't be added from the active ability cells
        const movementDestinations = this.getNormalMovementValidDestinations(builder);
        ResolverQuery.addTargets(legalTargets, InteractionTargetType.MovementDestination, movementDestinations);

        if (AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character)) {
            for (const flightDest of this.getWandererFlightDestinations(builder)) {
                if (!movementDestinations.some(destination => destination.equals(flightDest))) {
                    ResolverQuery.addTargets(
                        legalTargets,
                        InteractionTargetType.ActiveAbilityDestination,
                        [flightDest]
                    );
                }
            }
        }

        return ResolverQuery.createPositionRequest(new InteractionContext(this.character), legalTargets);
    }

    public override getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        if (!ResolverQuery.isFeedbackExpected(builder)) {
            return null;
        }

        const result = builder.getResults()[0];

        if (this.isNormalMovementResult(result)) {
            return super.getNextFeedback(builder);
        }

        if (this.isAbilityDestinationResult(result)) {
            return this.buildWandererMovementFeedback(result);
        }

        throw new Error(`Invalid Wanderer interaction type ${result.getResultType()}`);
    }

    /**
     * Returns all empty cells that are not adjacent to an enemy.
     *
     * Each candidate is validated through the standard action validation
     * mechanism before being exposed to the player.
     */
    private getWandererFlightDestinations(builder: ActionBuilder): Position[] {
        const destinations: Position[] = [];

        for (const cell of this.game.getBoard().getCells()) {
            if (cell.getCharacter() === null && !this.isCellAdjacentToEnemy(cell.getPosition())) {
                const destPos = cell.getPosition();

                const flightResult = ResolverQuery.createPositionResult(
                    new InteractionContext(this.character),
                    InteractionTargetType.ActiveAbilityDestination,
                    destPos
                );

                if (this.isValidWith(builder, flightResult, this.buildWandererMovementFeedback(flightResult))) {
                    destinations.push(destPos);
                }
            }
        }

        return destinations;
    }

    private isCellAdjacentToEnemy(cellPos: Position): boolean {
        return BoardQuery.getAdjacentCells(this.game.getBoard(), cellPos, cell => {
            const adjacentCharacter = cell.getCharacter();

            return adjacentCharacter !== null && adjacentCharacter.team !== this.character.team;
        }).length > 0;
    }

    private buildWandererMovementFeedback(result: InteractionResult): InteractionFeedback {
        const destination = ResolverQuery.getChosenPosition(result);

        return ResolverQuery.createSingleMotionFeedback(
            ActionMotionType.Fly, this.character, this.characterPos, destination
        );
    }
}
