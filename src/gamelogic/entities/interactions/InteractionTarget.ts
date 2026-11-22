import type { PlayableCharacter } from "../core/PlayableCharacter";
import type { Position } from "../core/Position";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";

export class InteractionTarget {
    private readonly targetType: InteractionTargetType;
    private readonly chosenPlayableCharacter: PlayableCharacter | null;
    private readonly chosenPosition: Position | null;

    private constructor(category: InteractionTargetType,
                        chosenPlayableCharacter: PlayableCharacter | null,
                        chosenPosition: Position | null) {
        if ((chosenPlayableCharacter !== null) === (chosenPosition !== null)) {
            throw new Error("There can be only one target data per interaction");
        }

        this.targetType = category;
        this.chosenPlayableCharacter = chosenPlayableCharacter;
        this.chosenPosition = chosenPosition;

        Object.freeze(this);
    }

    /**
     * Creates an interaction target representing a playable character.
     */
    public static fromPlayableCharacter(targetType: InteractionTargetType, 
                                        chosenPlayableCharacter: PlayableCharacter): InteractionTarget {
        return new InteractionTarget(targetType, chosenPlayableCharacter, null);
    }

    /**
     * Creates an interaction target representing a position.
     */
    public static fromPosition(targetType: InteractionTargetType, chosenPosition: Position): InteractionTarget {
        return new InteractionTarget(targetType, null, chosenPosition);
    }

    public getTargetType(): InteractionTargetType {
        return this.targetType;
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
            this.targetType === other.targetType &&
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

        return `InteractionTarget{category=${this.targetType}${characterStr}${positionStr}}`;
    }
}