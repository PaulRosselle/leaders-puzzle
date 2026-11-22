import type { Character } from "../../entities/core/Character";
import type { CharacterPath } from "../../entities/core/CharacterPath";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import { ActionBuilder } from "../../entities/interactions/ActionBuilder";
import { InteractionContext } from "../../entities/interactions/InteractionContext";
import type { InteractionFeedback } from "../../entities/interactions/InteractionFeedback";
import type { InteractionRequest } from "../../entities/interactions/InteractionRequest";
import type { InteractionTarget } from "../../entities/interactions/InteractionTarget";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";
import { BoardQuery } from "../../queries/BoardQuery";
import { ResolverQuery } from "../../queries/ResolverQuery";
import { ActionResolver } from "../ActionResolver";

/**
 * Resolves the Nemesis' movement.
 *
 * The Nemesis cannot perform the default movement action. Its movement is
 * replaced by a special movement of two cells. If no two-cell movement is
 * possible, it moves by one cell instead.
 *
 * When moving by two cells, the Nemesis cannot return to its original position.
 */
export class NemesisActionResolver extends ActionResolver {
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
            this.getValidNemesisMovementPaths(builder).map(path => path.getDestination())
        );

        return ResolverQuery.createPositionRequest(new InteractionContext(this.character), legalTargets);
    }

    public override getNextFeedback(builder: ActionBuilder): InteractionFeedback | null {
        if (!ResolverQuery.isFeedbackExpected(builder)) {
            return null;
        }

        const result = builder.getResults()[0];

        if (!this.isNormalMovementResult(result)) {
            throw new Error(`Invalid Nemesis interaction type ${result.getResultType()}`);
        }

        // We recover all legal paths using an empty builder to find one matching the result
        const legalPaths = this.getValidNemesisMovementPaths(new ActionBuilder(this.character));
        const resultPath = this.getPathMatchingResult(result, legalPaths);

        return this.buildNormalMovementFeedback(resultPath);
    }

    /**
     * Returns all valid paths available to the Nemesis.
     *
     * The Nemesis first attempts to move by two cells. A two-cell movement
     * requires both the intermediate and final cells to be empty. If at least
     * one such destination exists, only these destinations are returned.
     *
     * If no two-cell movement is possible, all empty cells adjacent to the
     * Nemesis are returned instead.
     *
     * The original position is excluded from two-cell destinations because
     * the Nemesis must end on a different cell when moving by two cells.
     */
    private getValidNemesisMovementPaths(builder: ActionBuilder): CharacterPath[] {
        const allPaths = BoardQuery.getEmptyPathsAround(
            this.game.getBoard(), this.characterPos, 2, false
        );

        const pathsAtTwo = this.getValidPathsAtDistance(builder, allPaths, 2);
        if (pathsAtTwo.length > 0) {
            return pathsAtTwo;
        }

        return this.getValidPathsAtDistance(builder, allPaths, 1);
    }

    private getValidPathsAtDistance(builder: ActionBuilder,
                                    allPaths: readonly CharacterPath[],
                                    distance: number): CharacterPath[] {
        const destinations = new Set<string>();
        const paths: CharacterPath[] = [];

        for (const path of allPaths) {
            const destination = path.getDestination();
            const key = destination.toString();

            if (path.getStepsCount() === distance &&
                !destination.equals(this.characterPos) &&
                !destinations.has(key)) {
                destinations.add(key);
                paths.push(path);
            }
        }

        const filteredPaths = this.filterValidPaths(builder, paths);

        // Prefer paths that avoid surrounding the Nemesis's leader.
        if (filteredPaths.length > 0) {
            return filteredPaths;
        }

        // If none are available, she is forced to choose a path that will surround her leader.
        return paths;
    }

    private filterValidPaths(builder: ActionBuilder, paths: readonly CharacterPath[]): CharacterPath[] {
        return paths.filter(path => {
            const result = ResolverQuery.createPositionResult(
                new InteractionContext(this.character),
                InteractionTargetType.MovementDestination,
                path.getDestination()
            );

            return this.isValidWith(builder, result, this.buildNormalMovementFeedback(path));
        });
    }
}
