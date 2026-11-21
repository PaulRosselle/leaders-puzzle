import type { Character } from "../core/Character";
import type { ActionMotion } from "./ActionMotion";

export class Action {
    public readonly srcCharacter: Character;
    public readonly motions: readonly ActionMotion[];

    constructor(srcCharacter: Character, motions: readonly ActionMotion[]) {
        this.srcCharacter = srcCharacter;
        this.motions = [...motions];
    }
}