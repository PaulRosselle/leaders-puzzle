import { ActionMotion } from "../entities/actions/ActionMotion";
import { ActionTarget } from "../entities/actions/ActionTarget";
import { Character } from "../entities/core/Character";
import { Position } from "../entities/core/Position";
import { TransformedState } from "../entities/projection/TransformedState";
import { ActionMotionType } from "../enums/ActionMotionType";

export class CharacterTransformQuery {
    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    /**
     * Gets the motion types that represent character transformations.
     *
     * @returns The list of transform and untransform motion types.
     */
    private static getTransformMotionTypes(): ActionMotionType[] {
        return [
            ActionMotionType.Transform,
            ActionMotionType.Untransform
        ];
    }

    /**
     * Checks whether the given motion is a transform or untransform motion.
     *
     * @param motion The motion to check.
     * @returns True if the motion represents a transformation.
     */
    public static isTransformMotion(motion: ActionMotion): boolean {
        return this.getTransformMotionTypes().includes(motion.motionType);
    }

    /**
     * Validates a transform motion and returns an error message if invalid.
     *
     * @param motion The motion to validate.
     * @returns An empty string if valid, or an error message otherwise.
     */
    private static getTransformMotionError(motion: ActionMotion): string {
        if (!this.isTransformMotion(motion)) {
            return `Invalid transform motion type: ${motion.motionType}`;
        }

        const targets = motion.targets;

        if (targets.length !== 2) {
            return "Invalid transform motion: exactly 2 targets expected";
        }

        const beforeCharacter = targets[0].character;
        const afterCharacter = targets[1].character;

        if (beforeCharacter.id !== afterCharacter.id) {
            return "Invalid transform motion: a single character is required";
        }

        return "";
    }

    /**
     * Extracts the transformed state from a character transform motion.
     *
     * @param motion The transform motion to process.
     * @returns The transformed state containing the original and transformed characters.
     * @throws Error if the motion is invalid.
     */
    public static getStateFromTransformMotion(motion: ActionMotion): TransformedState {
        const error = this.getTransformMotionError(motion);

        if (error !== "") {
            throw new Error(error);
        }

        const targets = motion.targets;
        return new TransformedState(targets[0].character, targets[1].character);
    }

    /**
     * Creates a motion representing the transformation or untransformation of a character.
     *
     * @param motionType The type of motion.
     * @param originCharacter The character before the transformation.
     * @param transformedCharacter The character after the transformation.
     * @param characterPosition The position of the character.
     * @returns The character action motion representing the transformation.
     */
    public static createTransformMotion(motionType: ActionMotionType,
                                        originCharacter: Character,
                                        transformedCharacter: Character,
                                        characterPosition: Position): ActionMotion {
        return new ActionMotion(motionType, [
            new ActionTarget(originCharacter, characterPosition, null),
            new ActionTarget(transformedCharacter, null, characterPosition)
        ]);
    }
}
