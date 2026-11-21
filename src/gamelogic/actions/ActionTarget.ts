import { Character } from "../projection/entities/Character";
import { Position } from "../projection/entities/Position";

export class ActionTarget {
    public readonly character: Character;
    public readonly originPos: Position | null;
    public readonly destPos: Position | null;

    constructor(character: Character, originPos: Position | null, destPos: Position | null) {
        this.character = character;
        this.originPos = originPos;
        this.destPos = destPos;
    }
}