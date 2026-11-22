import type { Character } from "../../entities/core/Character";
import type { Position } from "../../entities/core/Position";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import { ActionTarget } from "../../entities/actions/ActionTarget";
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
 * Resolves the Illusionist's active ability.
 *
 * The Illusionist swaps positions with a visible character in a straight
 * line that is not adjacent.
 *
 * The character to swap with is selected through a single interaction.
 * The destination of both characters is then determined automatically from
 * their respective starting positions.
 */
export class IllusionistActionResolver extends ActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        if (builder.getResults().length > 0) {
            return null;
        }

        // Normal movement and Illusionist swap targets cannot overlap:
        // a normal move requires an adjacent cell, while a targets cannot be adjacent.
        // For this reason, we can add both destinations without further treatment to avoid duplicates
        const legalTargets: InteractionTarget[] = [];

        ResolverQuery.addTargets(
            legalTargets,
            InteractionTargetType.MovementDestination,
            this.getNormalMovementValidDestinations(builder)
        );

        if (AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character)) {
            ResolverQuery.addTargets(
                legalTargets,
                InteractionTargetType.ActiveAbilityTargetPosition,
                this.getIllusionistTargetPositions(builder)
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

        if (!this.isAbilityTargetResult(result)) {
            throw new Error(`Invalid Illusionist interaction type ${result.getResultType()}`);
        }

        return this.buildSwapFeedback(result);
    }

    /**
     * Returns all valid characters that can be targeted by the Illusionist's active ability.
     *
     * The target must be a character visible in a straight line and must not
     * be adjacent to the Illusionist. Only the first character encountered
     * in each direction can be visible and targeted.
     */
    private getIllusionistTargetPositions(builder: ActionBuilder): Position[] {
        const targets: Position[] = [];

        for (const targetCharacterPos of BoardQuery.findVisibleCharacterPositions(
            this.game.getBoard(), this.characterPos, null, null, true
        )) {
            const targetPos = targetCharacterPos.position;
            const target = this.getCharacterAt(targetPos);

            if (target.team === this.character.team ||
                AbilityQuery.canBeMovedByEnemyAbilities(this.game, target)) {

                const swapResult = ResolverQuery.createPositionResult(
                    new InteractionContext(this.character),
                    InteractionTargetType.ActiveAbilityTargetPosition,
                    targetPos
                );

                if (this.isValidWith(builder, swapResult, this.buildSwapFeedback(swapResult))) {
                    targets.push(targetPos);
                }
            }
        }

        return targets;
    }

    private buildSwapFeedback(result: InteractionResult): InteractionFeedback {
        const targetPos = ResolverQuery.getChosenPosition(result);
        const target = this.getCharacterAt(targetPos);

        return ResolverQuery.createMotionFeedback(
            ActionMotionType.Swap,
            new ActionTarget(this.character, this.characterPos, targetPos),
            new ActionTarget(target, targetPos, this.characterPos)
        );
    }
}
