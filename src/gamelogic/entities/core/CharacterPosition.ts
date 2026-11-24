import type { Character } from "./Character";
import type { Position } from "./Position";

export class CharacterPosition {
    public readonly character: Character;
    public readonly position: Position;

    public constructor(character: Character, position: Position) {
        this.character = character;
        this.position = position;

        Object.freeze(this);
    }

    public static copy(characterPosition: CharacterPosition): CharacterPosition {
        return new CharacterPosition(characterPosition.character, characterPosition.position);
    }

    public static readonly byCharacterAndCoordinates = (a: CharacterPosition, b: CharacterPosition): number => {
        return (
            a.character.characterType - b.character.characterType ||
            a.character.team - b.character.team ||
            a.position.getQ() - b.position.getQ() ||
            a.position.getR() - b.position.getR() ||
            a.position.getS() - b.position.getS()
        );
    };
}