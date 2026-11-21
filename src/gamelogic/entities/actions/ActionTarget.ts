import { Character } from "../core/Character";
import { Position } from "../core/Position";

export class ActionTarget {
    public readonly character: Character;
    public readonly originPos: Position | null;
    public readonly destPos: Position | null;

    public constructor(character: Character, originPos: Position | null, destPos: Position | null) {
        this.character = character;
        this.originPos = originPos;
        this.destPos = destPos;

        Object.freeze(this);
    }
}