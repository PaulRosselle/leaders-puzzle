import { Position } from "../../gamelogic/entities/core/Position";
import type { Game } from "../../gamelogic/entities/projection/Game";
import type { VictoryCondition } from "../../gamelogic/entities/states/VictoryCondition";
import { CharacterType } from "../../gamelogic/enums/CharacterType";
import { Team } from "../../gamelogic/enums/Team";
import { GameQuery } from "../../gamelogic/queries/GameQuery";
import { PositionLabelMapper } from "../parser/PositionLabelMapper";

/** Team expressed relatively to the player, so the data never depends on a fixed color. */
type Side = "player" | "opponent";

interface RequiredCharacter {
    readonly characterType: CharacterType;
    readonly side: Side;
    readonly position: Position;
}

function resolveTeam(side: Side, playerTeam: Team): Team {
    return side === "player" ? playerTeam : Team.getOpposite(playerTeam);
}

/**
 * Wins when ALL required characters of at least ONE configuration
 * stand on their required position. The rest of the board is ignored.
 */
class RequiredCharactersVictory implements VictoryCondition {
    private readonly configurations: readonly (readonly RequiredCharacter[])[];

    public constructor(configurations: readonly (readonly RequiredCharacter[])[]) {
        this.configurations = configurations;
    }

    public isPlayerVictory(game: Game): boolean {
        const playerTeam = GameQuery.getPlayerTeam();

        return this.configurations.some(configuration =>
            configuration.every(({ characterType, side, position }) => {
                const character = game.board.getCell(position).getCharacter();
                return character !== null
                    && character.characterType === characterType
                    && character.team === resolveTeam(side, playerTeam);
            })
        );
    }
}

/** Builds a required character from a position label such as "B2". */
function at(characterType: CharacterType, side: Side, label: string): RequiredCharacter {
    const position = PositionLabelMapper.fromLabel(label);
    if (position === null) {
        throw new Error(`Invalid position label "${label}"`);
    }
    return { characterType, side, position };
}

const player = (characterType: CharacterType, label: string): RequiredCharacter => at(characterType, "player", label);
const opponent = (characterType: CharacterType, label: string): RequiredCharacter => at(characterType, "opponent", label);

const SPECIAL_VICTORIES: Readonly<Record<number, VictoryCondition>> = {
    40: new RequiredCharactersVictory([
        [
            player(CharacterType.Sniper, "B2"),
            player(CharacterType.Cub, "F5"),
            opponent(CharacterType.LeaderQueen, "G4"),
            player(CharacterType.Hermit, "G3"),
        ]
    ]),
};

export function getSpecialVictory(puzzleId: number): VictoryCondition | null {
    return SPECIAL_VICTORIES[puzzleId] ?? null;
}