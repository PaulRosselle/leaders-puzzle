import type { Character } from "../core/Character";
import type { Position } from "../core/Position";

export class CharacterState {
    private readonly character: Character;
    private readonly position: Position;
    private readonly playable: boolean;
    private readonly transformedCharacter: Character | null;

    public constructor(character: Character,
                       position: Position, 
                       mandatory: boolean,
                       transformedCharacter: Character | null) {
        this.character = character;
        this.position = position;
        this.playable = mandatory;
        this.transformedCharacter = transformedCharacter;

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
    
    public getTransformedCharacter(): Character | null {
        return this.transformedCharacter;
    }
}