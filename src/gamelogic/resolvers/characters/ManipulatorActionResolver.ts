import type { Character } from "../../entities/core/Character";
import type { Position } from "../../entities/core/Position";
import type { Game } from "../../entities/projection/Game";
import type { GameHistory } from "../../entities/actions/GameHistory";
import { Team } from "../../enums/Team";
import { AbilityQuery } from "../../queries/AbilityQuery";
import { BoardQuery } from "../../queries/BoardQuery";
import { MoverActionResolver } from "./MoverActionResolver";

/**
 * Resolves the Manipulator's active ability.
 *
 * The Manipulator moves an enemy visible in a straight line and not adjacent
 * by one cell. The enemy can be moved to any valid adjacent empty cell.
 *
 * The ability requires the player to first select the enemy to move, then
 * select its destination.
 */
export class ManipulatorActionResolver extends MoverActionResolver {
    public constructor(game: Game, gameHistory: GameHistory, character: Character) {
        super(game, gameHistory, character);
    }

    /**
     * Returns the positions of all enemies visible to the Manipulator.
     *
     * Only the first character encountered in each direction is considered.
     * Adjacent characters are excluded because the Manipulator can only target
     * non-adjacent enemies.
     */
    protected override getTargetPositions(): Position[] {
        const targets: Position[] = [];

        for (const targetCharacterPos of BoardQuery.findVisibleCharacterPositions(
            this.game.getBoard(),
            this.characterPos,
            Team.getOpposite(this.character.team),
            null,
            true
        )) {
            const target = this.getCharacterAt(targetCharacterPos.position);

            if (AbilityQuery.canBeMovedByEnemyAbilities(this.game, target)) {
                targets.push(targetCharacterPos.position);
            }
        }

        return targets;
    }
}
