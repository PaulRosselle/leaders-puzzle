import type { Character } from "../../entities/core/Character";
import { CharacterPath } from "../../entities/core/CharacterPath";
import type { Position } from "../../entities/core/Position";
import { ActionMotion } from "../../entities/actions/ActionMotion";
import { ActionTarget } from "../../entities/actions/ActionTarget";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import { ActionBuilder } from "../../entities/interactions/ActionBuilder";
import { InteractionContext } from "../../entities/interactions/InteractionContext";
import { InteractionFeedback } from "../../entities/interactions/InteractionFeedback";
import type { InteractionRequest } from "../../entities/interactions/InteractionRequest";
import type { InteractionTarget } from "../../entities/interactions/InteractionTarget";
import { ActionMotionType } from "../../enums/ActionMotionType";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";
import { AbilityQuery } from "../../queries/AbilityQuery";
import { BoardQuery } from "../../queries/BoardQuery";
import { ResolverQuery } from "../../queries/ResolverQuery";
import { CharacterActionResolver } from "../CharacterActionResolver";

/**
 * Resolves the Royal Guard's active ability.
 *
 * The Royal Guard can move directly to an empty cell adjacent to its Leader.
 * After this movement, it may move one additional cell.
 *
 * The destination selected by the player represents the final position of
 * the Royal Guard. The intermediate position adjacent to the Leader is
 * determined automatically.
 */
export class RoyalGuardActionResolver extends CharacterActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        // Royal Guard actions require a single interaction.
        // If an interaction has already been selected, no further interaction can be added.
        if (builder.getResults().length > 0) {
            return null;
        }

        const legalTargets: InteractionTarget[] = [];

        // Normal movement and Royal Guard ability destinations may overlap.
        // Normal movement has priority in that case.
        const movementDestinations = this.getNormalMovementValidDestinations(builder);

        ResolverQuery.addTargets(legalTargets, InteractionTargetType.MovementDestination, movementDestinations);

        if (AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character)) {
            for (const path of this.getRoyalGuardAbilityPaths(builder)) {
                const pathDestination = path.getDestination();

                if (!movementDestinations.some(destination => destination.equals(pathDestination))) {
                    ResolverQuery.addTargets(
                        legalTargets,
                        InteractionTargetType.ActiveAbilityDestination,
                        [pathDestination]
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
            // We recover all legal paths using an empty builder to find one matching the result
            const legalPaths = this.getRoyalGuardAbilityPaths(new ActionBuilder(this.character));
            const resultPath = this.getPathMatchingResult(result, legalPaths);

            return this.buildRoyalGuardMovementFeedback(resultPath);
        }

        throw new Error(`Invalid Royal Guard interaction type ${result.getResultType()}`);
    }

    /**
     * Returns all valid paths reachable through the Royal Guard's active ability.
     *
     * The first movement must place the Royal Guard on an empty cell adjacent
     * to its Leader. From each such intermediate position, the Guard may then
     * move to an adjacent empty cell. Each resulting action is validated before
     * its final destination is exposed to the player.
     */
    private getRoyalGuardAbilityPaths(builder: ActionBuilder): CharacterPath[] {
        const board = this.game.getBoard();
        const leaderCharacterPos = BoardQuery.findLeaderPosition(board, this.character.team);

        if (leaderCharacterPos === null) {
            return [];
        }

        const paths: CharacterPath[] = [];
        const destinations = new Set<string>();

        // First movement: an empty cell adjacent to the Leader.
        for (const firstLayerCell of BoardQuery.findEmptyCellsAround(board, leaderCharacterPos.position, 1)) {
            const firstLayerPos = firstLayerCell.getPosition();

            const firstLayerPath = new CharacterPath([this.characterPos, firstLayerPos]);
            if (this.isPathValid(builder, firstLayerPath)) {
                paths.push(firstLayerPath);
                destinations.add(firstLayerPath.getDestination().toString());
            }

            // Second movement: any adjacent empty cell.
            for (const secondLayerCell of BoardQuery.findEmptyCellsAround(board, firstLayerPos, 1)) {
                const secondLayerPos = secondLayerCell.getPosition();

                // Keep only the first valid path for each destination.
                if (destinations.has(secondLayerPos.toString())) {
                    continue;
                }

                const secondLayerPath = new CharacterPath([this.characterPos, firstLayerPos, secondLayerPos]);

                if (this.isPathValid(builder, secondLayerPath)) {
                    paths.push(secondLayerPath);
                    destinations.add(secondLayerPath.getDestination().toString());
                }
            }
        }

        return paths;
    }

    private isPathValid(builder: ActionBuilder, path: CharacterPath): boolean {
        const result = ResolverQuery.createPositionResult(
            new InteractionContext(this.character),
            InteractionTargetType.ActiveAbilityDestination,
            path.getDestination()
        );

        return this.isValidWith(builder, result, this.buildRoyalGuardMovementFeedback(path));
    }

    private buildRoyalGuardMovementFeedback(path: CharacterPath): InteractionFeedback {
        const abilityMotions: ActionMotion[] = [];

        const stepsCount = path.getStepsCount();
        if (stepsCount > 2) {
            throw new Error("Invalid royal guard path: path should not exceed two steps");
        }

        if (stepsCount > 1) {
            let previousPos: Position = path.getStart();

            for (const position of path.getPositions()) {
                if (!position.equals(path.getStart())) {
                    const motionType = position.equals(path.getDestination())
                        ? ActionMotionType.Move
                        : ActionMotionType.Teleport;

                    abilityMotions.push(
                        new ActionMotion(motionType, [
                            new ActionTarget(this.character, previousPos, position)
                        ])
                    );

                    previousPos = position;
                }
            }
        } else {
            abilityMotions.push(
                new ActionMotion(ActionMotionType.Teleport, [
                    new ActionTarget(this.character, path.getStart(), path.getDestination())
                ])
            );
        }

        return new InteractionFeedback(abilityMotions);
    }
}
