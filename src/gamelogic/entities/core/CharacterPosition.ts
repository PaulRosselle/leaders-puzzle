export class CharacterPosition {
    public readonly character: Character;
    public readonly position: Position;

    public constructor(character: Character, position: Position) {
        this.character = character;
        this.position = position;

        Object.freeze(this);
    }
}