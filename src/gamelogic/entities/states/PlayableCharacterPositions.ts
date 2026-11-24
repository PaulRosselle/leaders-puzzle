
import type { Position } from "../core/Position";

export class PlayableCharacterPositions {

    public readonly positions: readonly Position[];
    public readonly isMandatory: boolean;

    private constructor(positions: Position[], isMandatory: boolean) {
        this.positions = Object.freeze([...positions]);
        this.isMandatory = isMandatory;

        Object.freeze(this);
    }

    public static create(positions: Position[]): PlayableCharacterPositions {
        return new PlayableCharacterPositions(positions, false);
    }

    public static createMandatory(position: Position): PlayableCharacterPositions {
        return new PlayableCharacterPositions([position], true);
    }
}
