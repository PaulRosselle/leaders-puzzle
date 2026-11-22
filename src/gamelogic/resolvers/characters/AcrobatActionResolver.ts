import type { Cell } from "../../entities/projection/Cell";
import type { Character } from "../../entities/core/Character";
import { CharacterPath } from "../../entities/core/CharacterPath";
import type { Position } from "../../entities/core/Position";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import { ActionBuilder } from "../../entities/interactions/ActionBuilder";
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
 * Resolves the Acrobat's active ability.
 *
 * The Acrobat can jump over an adjacent character and land on the
 * following empty cell. It can perform up to two consecutive jumps.
 */
export class AcrobatActionResolver extends CharacterActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    public override getNextInteraction(builder: ActionBuilder): InteractionRequest | null {
        // If the action builder contains already a default movement interaction,
        // we leave the interaction to be handled by the parent default movement resolver
        if (builder.getResults().length > 0) {
            if (this.isNormalMovementResult(builder.getResults()[0])) {
                return super.getNextInteraction(builder);
            }
            return null;
        }

        // Normal movement and Acrobat jump destinations cannot overlap:
        // a normal move requires an adjacent cell, while a jump destination is at least two cells away.
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
                InteractionTargetType.ActiveAbilityDestination,
                this.getAcrobatJumpPaths(builder).map(jumpPath => jumpPath.getDestination())
            );
        }

        return ResolverQuery.createPositionRequest(new InteractionContext(this.character), legalTargets);
    }

    public override getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        // Acrobat actions only requires a single interaction.
        // When the result is gotten, a single feedback can be generated
        // containing either movement or active ability instructions
        if (builder.getResults().length !== 1 ||
            builder.getFeedbacks().length > 0 ||
            builder.isBuildCancelled()) {
            return null;
        }

        const result: InteractionResult = builder.getResults()[0];

        if (this.isNormalMovementResult(result)) {
            return super.getNextFeedback(builder);
        }

        if (this.isAbilityDestinationResult(result)) {
            // We recover all legal paths using an empty builder to find one matching the result
            const legalPaths = this.getAcrobatJumpPaths(new ActionBuilder(this.character));
            const resultPath = this.getPathMatchingResult(result, legalPaths);

            return ResolverQuery.createPathFeedback(this.character, resultPath, ActionMotionType.Jump);
        }

        throw new Error(`Invalid Acrobat interaction type ${result.getResultType()}`);
    }

    private getAcrobatJumpPaths(builder: ActionBuilder): CharacterPath[] {
        // First we find every jump path
        const jumpPaths: CharacterPath[] = [];
        const destinations = new Set<string>();

        for (const firstDirection of Direction.ALL) {
            const firstJumpDestination = this.findJumpDestination(this.characterPos, firstDirection);

            if (firstJumpDestination === null) {
                continue;
            }

            const firstJumpPos = firstJumpDestination.getPosition();

            // First jump paths
            if (!destinations.has(firstJumpPos.toString())) {
                jumpPaths.push(new CharacterPath([this.characterPos, firstJumpPos]));
                destinations.add(firstJumpPos.toString());
            }

            for (const secondDirection of Direction.ALL) {
                if (secondDirection === Direction.getOpposite(firstDirection)) {
                    continue;
                }

                const secondJumpDestination = this.findJumpDestination(firstJumpPos, secondDirection);

                // Second jump paths
                if (secondJumpDestination !== null) {
                    const secondJumpPos = secondJumpDestination.getPosition();

                    if (!destinations.has(secondJumpPos.toString())) {
                        jumpPaths.push(new CharacterPath([this.characterPos, firstJumpPos, secondJumpPos]));
                        destinations.add(secondJumpPos.toString());
                    }
                }
            }
        }

        // Then we filter out every invalid destination
        return jumpPaths.filter(jumpPath => {
            const jumpResult = ResolverQuery.createPositionResult(
                new InteractionContext(this.character),
                InteractionTargetType.ActiveAbilityDestination,
                jumpPath.getDestination()
            );
            const jumpFeedback = ResolverQuery.createPathFeedback(
                this.character, jumpPath, ActionMotionType.Jump
            );

            return this.isValidWith(builder, jumpResult, jumpFeedback);
        });
    }

    private findJumpDestination(originPos: Position, direction: Direction): Cell | null {
        // The Acrobat can jump over non-empty cells. The jump destination cell must be empty
        const board = this.game.getBoard();

        const adjacentCell = BoardQuery.findAdjacentCell(board, originPos, direction);
        if (adjacentCell === null || adjacentCell.getCharacter() === null) {
            return null;
        }

        const jumpDestination = BoardQuery.findAdjacentCell(board, adjacentCell.getPosition(), direction);
        if (jumpDestination === null || jumpDestination.getCharacter() !== null) {
            return null;
        }

        return jumpDestination;
    }
}
