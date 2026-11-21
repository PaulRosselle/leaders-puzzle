import { CharacterType } from '../../enums/CharacterType';
import { Team } from '../../enums/Team';

export class Character {
    public readonly id: string;
    public readonly characterType: CharacterType;
    public readonly team: Team;

    private constructor(id: string, characterType: CharacterType, team: Team) {
        this.id = id;
        this.characterType = characterType;
        this.team = team;

        Object.freeze(this);
    }

    /**
     * Creates a new character with a random UUID.
     */
    public static create(characterType: CharacterType, team: Team): Character {
        return new Character(globalThis.crypto.randomUUID(), characterType, team);
    }

    /**
     * Creates a new character instance based on an existing one.
     * The ID is preserved from the original character.
     */
    public static transform(character: Character, characterType: CharacterType, team: Team): Character {
        return new Character(character.id, characterType, team);
    }
}
