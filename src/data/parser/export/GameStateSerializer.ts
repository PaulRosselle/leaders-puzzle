import type { CharacterState } from "../../../gamelogic/entities/states/CharacterState";
import { CharacterType } from "../../../gamelogic/enums/CharacterType";
import { Team } from "../../../gamelogic/enums/Team";
import { getCharacterExportId } from "../CharacterIdMapping";
import { PositionLabelMapper } from "../PositionLabelMapper";

export class GameStateSerializer {

    public static serialize(characterStates: CharacterState[]): string {
        const white: string[] = [];
        const black: string[] = [];

        for (const state of characterStates) {
            const character = state.getCharacter();

            const characterType = character.characterType;

            const transformedCharacter = state.getTransformedCharacter();
            const isFrog = transformedCharacter !== null && 
                transformedCharacter?.characterType === CharacterType.Frog;

            const characterId = getCharacterExportId(characterType);
            const position = PositionLabelMapper.toLabel(state.getPosition());

            const entry = `${position}:${characterId}${isFrog ? "f" : ""}`;

            if (character.team === Team.White) {
                white.push(entry);
            } else {
                black.push(entry);
            }
        }

        const params = new URLSearchParams();

        if (white.length > 0) {
            params.set("white", white.join(","));
        }

        if (black.length > 0) {
            params.set("black", black.join(","));
        }

        return params.toString();
    }
}
