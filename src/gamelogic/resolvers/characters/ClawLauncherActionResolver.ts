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
import { CharacterActionResolver } from "../CharacterActionResolver";

/**
 * Resolves the Claw Launcher's active ability.
 *
 * The Claw Launcher can target a visible character in a straight line
 * and either move onto the target's position or pull the target onto
 * its own position.
 *
 * The choice between these two effects is encoded in the target
 * type selected by the player. The ability therefore requires
 * only a single interaction.
 */
export class ClawLauncherActionResolver extends CharacterActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        if (builder.getResults().length > 0) {
            return null;
        }

        const legalTargets: InteractionTarget[] = [];

        // Normal movement has priority over the Claw Launcher's active ability effect.
        const movementDestinations = this.getNormalMovementValidDestinations(builder);
        ResolverQuery.addTargets(legalTargets, InteractionTargetType.MovementDestination, movementDestinations);

        if (AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character)) {
            for (const targetPos of this.getClawLauncherValidTargetPositions()) {
                // The claw launcher can pull itself to any valid target
                const clawLauncherDestPos = this.getAbilityPullDestination(targetPos, this.characterPos);

                if (!movementDestinations.some(destination => destination.equals(clawLauncherDestPos)) &&
                    this.isValidPull(builder, InteractionTargetType.ActiveAbilityDestination, clawLauncherDestPos)) {
                    ResolverQuery.addTargets(
                        legalTargets,
                        InteractionTargetType.ActiveAbilityDestination,
                        [clawLauncherDestPos]
                    );
                }

                // The target can be pulled next to the claw launcher
                const target = this.getCharacterAt(targetPos);

                if ((target.team === this.character.team ||
                        AbilityQuery.canBeMovedByEnemyAbilities(this.game, target)) &&
                    this.isValidPull(builder, InteractionTargetType.ActiveAbilityTargetPosition, targetPos)) {
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

    public override getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        if (!ResolverQuery.isFeedbackExpected(builder)) {
            return null;
        }

        const result = builder.getResults()[0];

        if (this.isNormalMovementResult(result)) {
            return super.getNextFeedback(builder);
        }

        if (this.isAbilityTargetResult(result) ||
            this.isAbilityDestinationResult(result)) {
            return this.buildClawLauncherFeedback(result);
        }

        throw new Error(`Invalid Claw Launcher interaction type ${result.getResultType()}`);
    }

    /**
     * Returns all visible characters that can be targeted by the Claw Launcher.
     *
     * Only the first character encountered in each direction is visible
     * and can therefore be targeted.
     */
    private getClawLauncherValidTargetPositions(): Position[] {
        return BoardQuery.findVisibleCharacterPositions(
            this.game.getBoard(), this.characterPos, null, null, true
        ).map(characterPos => characterPos.position);
    }

    private isValidPull(builder: ActionBuilder,
                        targetType: InteractionTargetType,
                        targetPos: Position): boolean {
        const pullResult = ResolverQuery.createPositionResult(
            new InteractionContext(this.character), targetType, targetPos
        );

        return this.isValidWith(builder, pullResult, this.buildClawLauncherFeedback(pullResult));
    }

    private buildClawLauncherFeedback(result: InteractionResult): InteractionFeedback {
        // This can be either a target pos or the claw launcher pull destination
        const targetPos = ResolverQuery.getChosenPosition(result);

        if (this.isAbilityTargetResult(result)) {
            const target = this.getCharacterAt(targetPos);

            return ResolverQuery.createSingleMotionFeedback(
                ActionMotionType.Move,
                target,
                targetPos,
                this.getAbilityPullDestination(this.characterPos, targetPos)
            );
        }

        if (this.isAbilityDestinationResult(result)) {
            return ResolverQuery.createSingleMotionFeedback(
                ActionMotionType.Move, this.character, this.characterPos, targetPos
            );
        }

        throw new Error("Invalid target type for a Claw Launcher ability");
    }

    private getNormalizedPullVector(startCoordinate: number, endCoordinate: number): number {
        return Math.sign(startCoordinate - endCoordinate);
    }

    private getAbilityPullDestination(anchorPos: Position, pulledTargetPos: Position): Position {
        const q = this.getNormalizedPullVector(pulledTargetPos.coordinates.q, anchorPos.coordinates.q);
        const r = this.getNormalizedPullVector(pulledTargetPos.coordinates.r, anchorPos.coordinates.r);
        const s = this.getNormalizedPullVector(pulledTargetPos.coordinates.s, anchorPos.coordinates.s);

        for (const direction of Direction.ALL) {
            const directionCoordinates = Direction.getCoordinates(direction);

            if (directionCoordinates.q === q && directionCoordinates.r === r && directionCoordinates.s === s) {
                const adjacentPos = anchorPos.adjacent(direction);

                if (adjacentPos !== null) {
                    return adjacentPos;
                }
            }
        }

        throw new Error("Invalid pull target : no destination found");
    }
}
