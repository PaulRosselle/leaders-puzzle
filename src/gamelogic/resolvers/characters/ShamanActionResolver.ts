import { Character } from "../../entities/core/Character";
import type { Position } from "../../entities/core/Position";
import type { ActionMotion } from "../../entities/actions/ActionMotion";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import type { ActionBuilder } from "../../entities/interactions/ActionBuilder";
import { InteractionContext } from "../../entities/interactions/InteractionContext";
import { InteractionFeedback } from "../../entities/interactions/InteractionFeedback";
import type { InteractionRequest } from "../../entities/interactions/InteractionRequest";
import type { InteractionResult } from "../../entities/interactions/InteractionResult";
import type { InteractionTarget } from "../../entities/interactions/InteractionTarget";
import { ActionMotionType } from "../../enums/ActionMotionType";
import { CharacterType } from "../../enums/CharacterType";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";
import { AbilityQuery } from "../../queries/AbilityQuery";
import { BoardQuery } from "../../queries/BoardQuery";
import { CharacterTransformQuery } from "../../queries/CharacterTransformQuery";
import { ResolverQuery } from "../../queries/ResolverQuery";
import { ActionResolver } from "../ActionResolver";

/**
 * Resolves the Shaman's active ability.
 *
 * The Shaman transforms into a frog a character visible in a straight
 * line that is not adjacent to him.
 *
 * The character transformed is selected through a single interaction.
 * The destination of both characters is then determined automatically from
 * their respective starting positions.
 */
export class ShamanActionResolver extends ActionResolver {
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
            this.getNormalMovementValidDestinations(builder)
        );

        if (AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character)) {
            ResolverQuery.addTargets(
                legalTargets,
                InteractionTargetType.ActiveAbilityTargetPosition,
                this.getShamanTargetPositions(builder)
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
            throw new Error(`Invalid Shaman interaction type ${result.getResultType()}`);
        }

        return this.buildTransformFeedback(result);
    }

    /**
     * Returns all valid characters that can be targeted by the Shaman's active ability.
     *
     * The target must be a non-leader character visible in a straight line.
     * Only the first character encountered in each direction can be visible
     * and targeted.
     */
    private getShamanTargetPositions(builder: ActionBuilder): Position[] {
        const targets: Position[] = [];

        for (const targetCharacterPos of BoardQuery.findVisibleCharacterPositions(
            this.game.getBoard(), this.characterPos, null, null, false
        )) {
            const targetPos = targetCharacterPos.position;
            const target = this.getCharacterAt(targetPos);

            if (!CharacterType.isLeader(target.characterType)) {
                const transformResult = ResolverQuery.createPositionResult(
                    new InteractionContext(this.character),
                    InteractionTargetType.ActiveAbilityTargetPosition,
                    targetPos
                );

                if (this.isValidWith(builder, transformResult, this.buildTransformFeedback(transformResult))) {
                    targets.push(targetPos);
                }
            }
        }

        return targets;
    }

    /**
     * Builds feedback for transforming the selected character into a Frog.
     * Any character already transformed into a Frog is untransformed first.
     *
     * @param result the interaction result containing the selected position
     * @returns the interaction feedback representing the untransformation and new transformation
     */
    private buildTransformFeedback(result: InteractionResult): InteractionFeedback {
        const motions: ActionMotion[] = [];

        const targetPos = ResolverQuery.getChosenPosition(result);
        let target = this.getCharacterAt(targetPos);

        // First we untransform any existing frog
        const transformedFrogState = AbilityQuery.getExistingTransformedFrogState(this.game);

        if (transformedFrogState !== null) {
            motions.push(
                CharacterTransformQuery.createTransformMotion(
                    ActionMotionType.Untransform,
                    transformedFrogState.characterAfter,
                    transformedFrogState.characterBefore,
                    BoardQuery.getPositionByCharacterId(
                        this.game.getBoard(), transformedFrogState.characterId
                    ).position
                )
            );

            // If the target was already transformed into a frog, we must use its original type
            if (target.id === transformedFrogState.characterId) {
                target = transformedFrogState.characterBefore;
            }
        }

        // Then we add the frog transformation motion
        const transformedTarget = Character.transform(target, CharacterType.Frog, target.team);

        motions.push(
            CharacterTransformQuery.createTransformMotion(
                ActionMotionType.Transform, target, transformedTarget, targetPos
            )
        );

        return new InteractionFeedback(motions);
    }
}
