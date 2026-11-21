import { Character } from './Character';

export class TransformedState {
    public readonly characterBefore: Character;
    public readonly characterAfter: Character;

    private constructor(characterBefore: Character, characterAfter: Character) {
        if (characterBefore.id !== characterAfter.id) {
            throw new Error('Cannot create a transformed state for two different characters');
        }

        this.characterBefore = characterBefore;
        this.characterAfter = characterAfter;

        Object.freeze(this);
    }

    /**
     * Returns the ID of the transformed character.
     */
    public get characterId(): string {
        return this.characterAfter.id;
    }
}
