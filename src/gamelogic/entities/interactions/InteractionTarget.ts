import type { PlayableCharacter } from "../core/PlayableCharacter";
import type { Position } from "../core/Position";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";

export class InteractionTarget {
    private readonly type: InteractionTargetType;
    private readonly chosenPlayableCharacter: PlayableCharacter | null;
    private readonly chosenPosition: Position | null;

    private constructor(category: InteractionTargetType,
                        chosenPlayableCharacter: PlayableCharacter | null,
                        chosenPosition: Position | null) {
        if ((chosenPlayableCharacter !== null) === (chosenPosition !== null)) {
            throw new Error("There can be only one target data per interaction");
        }

        this.type = category;
        this.chosenPlayableCharacter = chosenPlayableCharacter;
        this.chosenPosition = chosenPosition;

        Object.freeze(this);
    }

    /**
     * Creates an interaction target representing a playable character.
     */
    public static fromPlayableCharacter(type: InteractionTargetType, 
                                        chosenPlayableCharacter: PlayableCharacter): InteractionTarget {
        return new InteractionTarget(type, chosenPlayableCharacter, null);
    }

    /**
     * Creates an interaction target representing a position.
     */
    public static fromPosition(type: InteractionTargetType, chosenPosition: Position): InteractionTarget {
        return new InteractionTarget(type, null, chosenPosition);
    }

    public getType(): InteractionTargetType {
        return this.type;
    }

    public getChosenPlayableCharacter(): PlayableCharacter {
        if (this.chosenPlayableCharacter === null) {
            throw new Error("No playable character found within interaction target");
        }
        return this.chosenPlayableCharacter;
    }

    public getNonNullChosenPosition(): Position {
        if (this.chosenPosition === null) {
            throw new Error("No position found within interaction target");
        }
        return this.chosenPosition;
    }

    /**
     * Checks whether two interaction targets are equal.
     */
    public equals(other: InteractionTarget): boolean {
        return (
            this.type === other.type &&
            this.chosenPlayableCharacter === other.chosenPlayableCharacter &&
            (
                this.chosenPosition === other.chosenPosition ||
                (
                    this.chosenPosition !== null &&
                    other.chosenPosition !== null &&
                    this.chosenPosition.equals(other.chosenPosition)
                )
            )
        );
    }

    public toString(): string {
        const characterStr = this.chosenPlayableCharacter !== null ? `, character=${this.chosenPlayableCharacter}` : "";
        const positionStr = this.chosenPosition !== null ? `, position=${this.chosenPosition}` : "";

        return `InteractionTarget{category=${this.type}${characterStr}${positionStr}}`;
    }
}