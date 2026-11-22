import type { Character } from "../../entities/core/Character";
import type { Position } from "../../entities/core/Position";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import { BoardQuery } from "../../queries/BoardQuery";
import { ResolverQuery } from "../../queries/ResolverQuery";
import { MoverActionResolver } from "./MoverActionResolver";

/**
 * Resolves the Brewmaster's active ability.
 *
 * The Brewmaster can move an adjacent allied character by one cell.
 * The ability requires the player to first select an adjacent ally, then
 * select an empty cell adjacent to that ally.
 */
export class BrewmasterActionResolver extends MoverActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    /**
     * Returns the positions of all allied characters adjacent to the Brewmaster.
     *
     * Only characters belonging to the Brewmaster's team are considered.
     * Empty cells and enemy characters are ignored.
     */
    protected override getTargetPositions(): Position[] {
        const allyCells = BoardQuery.getAdjacentCells(this.game.getBoard(), this.characterPos, cell => {
            const adjacentCharacter = cell.getCharacter();

            return adjacentCharacter !== null && adjacentCharacter.team === this.character.team;
        });

        return ResolverQuery.getPositions(allyCells);
    }
}
