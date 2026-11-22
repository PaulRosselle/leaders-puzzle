import type { Position } from "../core/Position";
import { InteractionTargetType } from "../../enums/interactions/InteractionTargetType";

export class InteractionTarget {
    private readonly targetType: InteractionTargetType;
    private readonly chosenPosition: Position;

    public constructor(category: InteractionTargetType, chosenPosition: Position) {
        this.targetType = category;
        this.chosenPosition = chosenPosition;

        Object.freeze(this);
    }

    public getTargetType(): InteractionTargetType {
        return this.targetType;
    }

    public getChosenPosition(): Position {
        return this.chosenPosition;
    }

    /**
     * Checks whether two interaction targets are equal.
     */
    public equals(other: InteractionTarget): boolean {
        return (
            this.targetType === other.targetType &&
            this.chosenPosition.equals(other.chosenPosition)
        );
    }

    public toString(): string {
        const positionStr = this.chosenPosition !== null ? `, position=${this.chosenPosition}` : "";

        return `InteractionTarget{category=${this.targetType}${positionStr}}`;
    }
}