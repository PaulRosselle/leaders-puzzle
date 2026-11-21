import { Position } from "../core/Position";
import { Character } from "../core/Character";

export class Cell {
    private readonly position: Position;
    private character: Character | null = null;

    constructor(position: Position) {
        this.position = position;
    }

    public getPosition(): Position {
        return this.position;
    }

    public setCharacter(character: Character | null): void {
        this.character = character;
    }

    public getCharacter(): Character | null {
        return this.character;
    }
}