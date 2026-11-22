import type { Character } from "./Character";
import type { CharacterPosition } from "./CharacterPosition";
import type { Position } from "./Position";

export class PlayableCharacter {
    private readonly characherPosition: CharacterPosition;
    private readonly mandatory: boolean;

    public constructor(characherPosition: CharacterPosition, mandatory: boolean) {
        this.characherPosition = characherPosition;
        this.mandatory = mandatory;

        Object.freeze(this);
    }

    public getCharacter(): Character {
        return this.characherPosition.character;
    }

    public getPosition(): Position {
        return this.characherPosition.position;
    }

    public isMandatory(): boolean {
        return this.mandatory;
    }
}