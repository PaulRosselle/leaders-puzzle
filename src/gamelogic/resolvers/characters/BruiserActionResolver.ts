import type { Cell } from "../../entities/projection/Cell";
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
import { Direction } from "../../enums/Direction";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";
import { AbilityQuery } from "../../queries/AbilityQuery";
import { BoardQuery } from "../../queries/BoardQuery";
import { ResolverQuery } from "../../queries/ResolverQuery";
import { ActionResolver } from "../ActionResolver";

/**
 * Resolves the Bruiser's active ability.
 *
 * The Bruiser moves onto the cell occupied by an adjacent enemy and pushes
 * that enemy onto one of the three cells opposite to the Bruiser's origin.
 *
 * The ability requires the player to first select an adjacent enemy, then
 * select a valid destination for the pushed enemy.
 */
export class BruiserActionResolver extends ActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        if (builder.getResults().length === 0) {
            return this.buildInitialInteraction(builder);
        }

        if (builder.isBuildCancelled()) {
            return null;
        }

        const firstResult = builder.getResults()[0];

        if (this.isNormalMovementResult(firstResult)) {
            return super.getNextInteraction(builder);
        }

        if (this.isAbilityTargetResult(firstResult)) {
            if (builder.getResults().length > 1) {
                if (!this.isAbilityDestinationResult(builder.getResults()[1])) {
                    throw new Error("Invalid result type for a Bruiser ability activation");
                }
                return null;
            }

            return this.buildPushDestinationInteraction(builder, firstResult);
        }

        throw new Error("Invalid Bruiser action builder");
    }

    public override getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        if (!ResolverQuery.isFeedbackExpected(builder)) {
            return null;
        }

        const firstResult = builder.getResults()[0];

        if (this.isNormalMovementResult(firstResult)) {
            return super.getNextFeedback(builder);
        }

        if (builder.getResults().length < 2) {
            return null;
        }

        const destinationResult = builder.getResults()[1];

        if (!this.isAbilityTargetResult(firstResult) || !this.isAbilityDestinationResult(destinationResult)) {
            throw new Error("Invalid result types for a Bruiser ability activation");
        }

        const targetOrigin = ResolverQuery.getChosenPosition(firstResult);
        const destination = ResolverQuery.getChosenPosition(destinationResult);
        const target = this.getCharacterAt(targetOrigin);

        return ResolverQuery.createMotionFeedback(
            ActionMotionType.Push,
            new ActionTarget(this.character, this.characterPos, targetOrigin),
            new ActionTarget(target, targetOrigin, destination)
        );
    }

    private buildInitialInteraction(builder: ActionBuilder): InteractionRequest {
        const legalTargets: InteractionTarget[] = [];

        ResolverQuery.addTargets(
            legalTargets,
            InteractionTargetType.MovementDestination,
            this.getNormalMovementValidDestinations(builder)
        );

        if (AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character)) {
            for (const enemyPosition of this.getAdjacentEnemyPositions()) {
                if (this.getValidPushDestinations(builder, enemyPosition, true).length > 0) {
                    ResolverQuery.addTargets(
                        legalTargets,
                        InteractionTargetType.ActiveAbilityTargetPosition,
                        [enemyPosition]
                    );
                }
            }
        }

        return ResolverQuery.createPositionRequest(new InteractionContext(this.character), legalTargets);
    }

    private buildPushDestinationInteraction(builder: ActionBuilder,
                                            result: InteractionResult): InteractionRequest {
        if (!this.isAbilityTargetResult(result)) {
            throw new Error("A Bruiser ability target must be selected through a PositionChosen result");
        }

        const targetPos = ResolverQuery.getChosenPosition(result);

        const legalTargets: InteractionTarget[] = [];

        ResolverQuery.addTargets(
            legalTargets,
            InteractionTargetType.ActiveAbilityDestination,
            this.getValidPushDestinations(builder, targetPos, false)
        );

        const targetedEnemy = this.getCharacterAt(targetPos);
        return ResolverQuery.createPositionRequest(
            new InteractionContext(this.character, targetedEnemy),
            legalTargets
        );
    }

    /**
     * Returns the positions of all enemies adjacent to the Bruiser.
     *
     * Only enemy characters that can be moved by enemy abilities are
     * considered as valid targets for the active ability.
     */
    private getAdjacentEnemyPositions(): Position[] {
        const enemyCells: Cell[] = BoardQuery.getAdjacentCells(this.game.getBoard(), this.characterPos, cell => {
            const target = cell.getCharacter();

            return target !== null &&
                target.team !== this.character.team &&
                AbilityQuery.canBeMovedByEnemyAbilities(this.game, target);
        });

        return ResolverQuery.getPositions(enemyCells);
    }

    /**
     * Returns the valid destinations to which the selected enemy can be pushed.
     *
     * The Bruiser can push the target onto any of the three cells opposite
     * to the Bruiser relative to the target's current position. The cell
     * corresponding to the Bruiser's current position is therefore excluded.
     *
     * Each candidate destination is validated by building the corresponding
     * temporary action and passing it through the standard action validation.
     *
     * @param builder current action builder
     * @param targetPos current position of the enemy targeted by the ability
     * @param exitAfterFirstValidDest whether the search can stop after finding
     *                                the first valid destination
     */
    private getValidPushDestinations(builder: ActionBuilder,
                                     targetPos: Position,
                                     exitAfterFirstValidDest: boolean): Position[] {
        const target = this.getCharacterAt(targetPos);

        const straightPushDirection = this.findStraightPushDirection(targetPos);

        const pushDirections: Direction[] = [
            Direction.getNext(straightPushDirection, false),
            straightPushDirection,
            Direction.getNext(straightPushDirection, true)
        ];

        // If the target result is missing, we add it before entering the destination loop
        const targetBuilder = this.withAbilityTargetSelected(builder, targetPos);

        const destinations: Position[] = [];

        for (const direction of pushDirections) {
            const pushCell = BoardQuery.findAdjacentCell(this.game.getBoard(), targetPos, direction);

            if (pushCell === null || pushCell.getCharacter() !== null) {
                continue;
            }

            const pushDestPos = pushCell.getPosition();

            const pushResult = ResolverQuery.createPositionResult(
                new InteractionContext(this.character, target),
                InteractionTargetType.ActiveAbilityDestination,
                pushDestPos
            );
            const pushFeedback = ResolverQuery.createMotionFeedback(
                ActionMotionType.Push,
                new ActionTarget(this.character, this.characterPos, targetPos),
                new ActionTarget(target, targetPos, pushDestPos)
            );

            if (this.isValidWith(targetBuilder, pushResult, pushFeedback)) {
                destinations.push(pushDestPos);

                if (exitAfterFirstValidDest) {
                    return destinations;
                }
            }
        }

        return destinations;
    }

    private findStraightPushDirection(targetPos: Position): Direction {
        for (const direction of Direction.ALL) {
            const adjacentPos = this.characterPos.adjacent(direction);

            if (adjacentPos !== null && targetPos.equals(adjacentPos)) {
                return direction;
            }
        }

        throw new Error("Target position is not adjacent to the Bruiser");
    }
}
