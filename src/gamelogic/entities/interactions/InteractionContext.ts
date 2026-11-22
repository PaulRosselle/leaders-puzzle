import type { Character } from "../core/Character";

export class InteractionContext {
    public readonly sourceCharacter: Character | null;
    public readonly targetCharacter: Character | null;

    /**
     * Creates an empty interaction context.
     */
    public constructor();

    /**
     * Creates an interaction context where the source
     * and target characters are the same.
     */
    public constructor(sourceAndTargetCharacter: Character);

    /**
     * Creates an interaction context with distinct
     * source and target characters.
     */
    public constructor(sourceCharacter: Character, targetCharacter: Character);

    public constructor(sourceCharacter: Character | null = null,
                       targetCharacter?: Character) {
        this.sourceCharacter = sourceCharacter;
        this.targetCharacter = targetCharacter === undefined ? sourceCharacter : targetCharacter;

        Object.freeze(this);
    }

    public getSourceCharacter(): Character | null {
        return this.sourceCharacter;
    }

    public getTargetCharacter(): Character | null {
        return this.targetCharacter;
    }

    public getNonNullSourceCharacter(): Character {
        if (this.sourceCharacter === null) {
            throw new Error("No source character found within interaction context");
        }
        return this.sourceCharacter;
    }

    public getNonNullTargetCharacter(): Character {
        if (this.targetCharacter === null) {
            throw new Error("No target character found within interaction context");
        }
        return this.targetCharacter;
    }
}
