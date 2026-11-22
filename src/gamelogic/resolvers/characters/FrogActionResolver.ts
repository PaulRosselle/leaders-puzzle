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
import { ResolverQuery } from "../../queries/ResolverQuery";
import { CharacterActionResolver } from "../CharacterActionResolver";

/**
 * Resolves the Frog's special ability.
 *
 * The Frog can use its normal movement to jump to any empty cell in a range of two cells.
 *
 * The destination is selected directly by the player through a single
 * interaction. The selected destination is then used to build the movement
 * feedback.
 */
export class FrogActionResolver extends CharacterActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        if (builder.getResults().length > 0) {
            return null;
        }

        const legalTargets: InteractionTarget[] = [];

        ResolverQuery.addTargets(
            legalTargets,
            InteractionTargetType.MovementDestination,
            this.getFrogMovementDestinations(builder)
        );

        return ResolverQuery.createPositionRequest(new InteractionContext(this.character), legalTargets);
    }

    public override getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        if (!ResolverQuery.isFeedbackExpected(builder)) {
            return null;
        }

        return this.buildFrogMovementFeedback(builder.getResults()[0]);
    }

    /**
     * Returns all empty cells in a range of two tiles around the frog.
     *
     * Each candidate is validated through the standard action validation
     * mechanism before being exposed to the player.
     */
    private getFrogMovementDestinations(builder: ActionBuilder): Position[] {
        const destinations: Position[] = [];

        for (const cell of this.game.getBoard().getCells()) {
            const cellPosition = cell.getPosition();

            if (cell.getCharacter() === null &&
                !this.characterPos.equals(cellPosition) &&
                this.characterPos.distanceTo(cellPosition) <= 2) {

                const result = ResolverQuery.createPositionResult(
                    new InteractionContext(this.character),
                    InteractionTargetType.MovementDestination,
                    cellPosition
                );
                const feedback = this.buildFrogMovementFeedback(result);

                if (this.isValidWith(builder, result, feedback)) {
                    destinations.push(cellPosition);
                }
            }
        }

        return destinations;
    }

    private buildFrogMovementFeedback(result: InteractionResult): InteractionFeedback {
        const destination = ResolverQuery.getChosenPosition(result);

        return ResolverQuery.createSingleMotionFeedback(
            ActionMotionType.Jump, this.character, this.characterPos, destination
        );
    }
}
