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
import { Direction } from "../../enums/Direction";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";
import { AbilityQuery } from "../../queries/AbilityQuery";
import { BoardQuery } from "../../queries/BoardQuery";
import { ResolverQuery } from "../../queries/ResolverQuery";
import { ActionResolver } from "../ActionResolver";

/**
 * Resolves the Rider's active ability.
 *
 * The Rider can move two cells in a straight line. Both cells crossed by
 * the movement must be valid for the movement to be performed.
 */
export class RiderActionResolver extends ActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        if (builder.getResults().length > 0) {
            return null;
        }

        const legalTargets: InteractionTarget[] = [];

        // Normal movement and Rider dash destinations cannot overlap:
        // a normal move requires an adjacent cell, while a dash destination is at exactly two cells away.
        // For this reason, we can add both destinations without further treatment to avoid duplicates
        ResolverQuery.addTargets(
            legalTargets,
            InteractionTargetType.MovementDestination,
            this.getNormalMovementValidDestinations(builder)
        );

        if (AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character)) {
            ResolverQuery.addTargets(
                legalTargets,
                InteractionTargetType.ActiveAbilityDestination,
                this.getRiderDashDestinations(builder)
            );
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
            return this.buildRiderDashFeedback(result);
        }

        throw new Error(`Invalid Rider interaction type ${result.getResultType()}`);
    }

    /**
     * Returns all valid destinations reachable by the Rider's active ability.
     *
     * The Rider moves exactly two cells in a straight line. The intermediate
     * cell must therefore exist and be empty, as must the destination cell.
     */
    private getRiderDashDestinations(builder: ActionBuilder): Position[] {
        const board = this.game.getBoard();
        const destinations: Position[] = [];

        for (const direction of Direction.ALL) {
            const intermediateCell = BoardQuery.findAdjacentCell(board, this.characterPos, direction);

            if (intermediateCell === null || intermediateCell.getCharacter() !== null) {
                continue;
            }

            const destCell = BoardQuery.findAdjacentCell(board, intermediateCell.getPosition(), direction);

            if (destCell === null || destCell.getCharacter() !== null) {
                continue;
            }

            const destPos = destCell.getPosition();

            const dashResult = ResolverQuery.createPositionResult(
                new InteractionContext(this.character),
                InteractionTargetType.ActiveAbilityDestination,
                destPos
            );

            if (this.isValidWith(builder, dashResult, this.buildRiderDashFeedback(dashResult))) {
                destinations.push(destPos);
            }
        }

        return destinations;
    }

    private buildRiderDashFeedback(result: InteractionResult): InteractionFeedback {
        const destination = ResolverQuery.getChosenPosition(result);

        return ResolverQuery.createSingleMotionFeedback(
            ActionMotionType.Move, this.character, this.characterPos, destination
        );
    }
}
