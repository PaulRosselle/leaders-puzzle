import type { Character } from "../../entities/core/Character";
import type { Position } from "../../entities/core/Position";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import { CharacterType } from "../../enums/CharacterType";
import { Team } from "../../enums/Team";
import { AbilityQuery } from "../../queries/AbilityQuery";
import { BoardQuery } from "../../queries/BoardQuery";
import { MoverActionResolver } from "./MoverActionResolver";

/**
 * Resolves the Tactician's active ability.
 *
 * When an ally is adjacent to the opponent's leader, the Tactician can move any ally
 * by one cell. The ally can be moved to any valid adjacent empty cell.
 *
 * The ability requires the player to first select the ally to move, then
 * select its destination.
 */
export class TacticianActionResolver extends MoverActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    /**
     * Checks whether the Tactician can use its active ability.
     *
     * @returns true if the ability can be used and at least one friendly
     *          character is adjacent to the enemy leader, false otherwise
     */
    protected override canUseActiveAbility(): boolean {
        if (!AbilityQuery.canUseActiveAbility(this.game, this.gameHistory, this.character)) {
            return false;
        }

        const tacticianTeam = this.character.team;
        const board = this.game.getBoard();

        const enemyLeaderPos = BoardQuery.findLeaderPosition(board, Team.getOpposite(tacticianTeam));
        if (enemyLeaderPos === null) {
            return false;
        }

        return BoardQuery.getAdjacentCells(board, enemyLeaderPos.position, adjacentCell => {
            const adjacentCharacter = adjacentCell.getCharacter();

            return adjacentCharacter !== null && adjacentCharacter.team === tacticianTeam;
        }).length > 0;
    }

    /**
     * Gets the positions of all other non-leader characters belonging to the Tactician's team.
     */
    protected override getTargetPositions(): Position[] {
        return BoardQuery.findCharacterPositions(this.game.getBoard(), this.character.team, null)
            .map(characterPos => characterPos.position)
            .filter(position => {
                const candidate = this.getCharacterAt(position);

                return candidate.id !== this.character.id &&
                    !CharacterType.isLeader(candidate.characterType);
            });
    }
}
