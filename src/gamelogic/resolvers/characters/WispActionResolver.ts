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
import { ActionResolver } from "../ActionResolver";

/**
 * Resolves the Wisp's special ability.
 *
 * The Wisp can use its normal movement to fly to any empty cell.
 *
 * The destination is selected directly by the player through a single
 * interaction. The selected destination is then used to build the movement
 * feedback.
 */
export class WispActionResolver extends ActionResolver {
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
            this.getWispFlightDestinations(builder)
        );

        return ResolverQuery.createPositionRequest(new InteractionContext(this.character), legalTargets);
    }

    public override getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        if (!ResolverQuery.isFeedbackExpected(builder)) {
            return null;
        }

        return this.buildWispMovementFeedback(builder.getResults()[0]);
    }

    /**
     * Returns all empty cells.
     *
     * Each candidate is validated through the standard action validation
     * mechanism before being exposed to the player.
     */
    private getWispFlightDestinations(builder: ActionBuilder): Position[] {
        const destinations: Position[] = [];

        for (const cell of this.game.getBoard().getCells()) {
            if (cell.getCharacter() === null) {
                const destPos = cell.getPosition();

                const result = ResolverQuery.createPositionResult(
                    new InteractionContext(this.character),
                    InteractionTargetType.MovementDestination,
                    destPos
                );
                const feedback = this.buildWispMovementFeedback(result);

                if (this.isValidWith(builder, result, feedback)) {
                    destinations.push(destPos);
                }
            }
        }

        return destinations;
    }

    private buildWispMovementFeedback(result: InteractionResult): InteractionFeedback {
        const destination = ResolverQuery.getChosenPosition(result);

        return ResolverQuery.createSingleMotionFeedback(
            ActionMotionType.Fly, this.character, this.characterPos, destination
        );
    }
}
