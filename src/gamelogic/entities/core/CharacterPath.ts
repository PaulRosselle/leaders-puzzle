import { Position } from "./Position";

export class CharacterPath {
    public readonly path: readonly Position[];

    public constructor(path: Position[]) {
        if (path.length < 2) {
            throw new Error("A path requires at least a start and a destination");
        }

        this.path = [...path];

        Object.freeze(this);
    }

    public getStart(): Position {
        return this.path[0];
    }

    public getDestination(): Position {
        return this.path[this.path.length - 1];
    }

    public getStepsCount(): number {
        return this.path.length - 1;
    }
}
