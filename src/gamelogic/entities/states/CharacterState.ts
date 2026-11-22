import type { Character } from "../core/Character";
import type { Position } from "../core/Position";

export class CharacterState {
    public readonly character: Character;
    public readonly position: Position;
    private readonly playable: boolean;

    public constructor(character: Character, position: Position, mandatory: boolean) {
        this.character = character;
        this.position = position;
        this.playable = mandatory;

        Object.freeze(this);
    }

    public getCharacter(): Character {
        return this.character;
    }

    public getPosition(): Position {
        return this.position;
    }

    public isPlayable(): boolean {
        return this.playable;
    }
}