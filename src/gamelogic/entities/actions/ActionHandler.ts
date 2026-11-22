import { Action } from "./Action";
import { ActionMotion } from "./ActionMotion";
import { Game } from "../projection/Game";
import { TransformedState } from "../projection/TransformedState";
import { ActionMotionType } from "../../enums/ActionMotionType";
import { CharacterTransformQuery } from "../../queries/CharacterTransformQuery";

export class ActionHandler {
    private readonly game: Game;
    private readonly action: Action;

    public constructor(game: Game, action: Action) {
        this.game = game;
        this.action = action;
    }

    /**
     * Applies the character action to the game.
     *
     * Four target cases are handled:
     * 1. Movement (originPos -> destPos)
     * 2. Addition (null -> destPos)
     * 3. Removal (originPos -> null)
     * 4. Targeting only (null -> null)
     */
    public doAction(): void {
        const board = this.game.getBoard();

        for (const motion of this.action.motions) {
            // Remove characters from their original positions first.
            // This prevents character swaps from removing an already
            // placed character.
            for (const target of motion.targets) {
                if (target.originPos !== null) {
                    board.getCell(target.originPos).setCharacter(null);
                }
            }

            // Then place characters at their destination positions.
            for (const target of motion.targets) {
                if (target.destPos !== null) {
                    board.getCell(target.destPos).setCharacter(target.character);
                }
            }

            this.updateTransformedState(motion, false);
        }
    }

    /**
     * Reverts the character action.
     */
    public undoAction(): void {
        const board = this.game.getBoard();

        // Motions must be undone in reverse order.
        for (let i = this.action.motions.length - 1; i >= 0; i--) {
            const motion = this.action.motions[i];

            this.updateTransformedState(motion, true);

            // Remove characters from their destination positions first.
            for (const target of motion.targets) {
                if (target.destPos !== null) {
                    board.getCell(target.destPos).setCharacter(null);
                }
            }

            // Restore characters to their original positions.
            for (const target of motion.targets) {
                if (target.originPos !== null) {
                    board.getCell(target.originPos).setCharacter(target.character);
                }
            }
        }
    }

    /**
     * Updates the transformed state associated with a motion.
     *
     * @param motion The motion whose transformed state should be updated.
     * @param undoAction Whether the action is being undone.
     */
    private updateTransformedState( motion: ActionMotion, undoAction: boolean): void {
        if (!CharacterTransformQuery.isTransformMotion(motion)) {
            return;
        }

        const newState = CharacterTransformQuery.getStateFromTransformMotion(motion);

        if (motion.motionType === ActionMotionType.Transform) {
            this.applyTransformState(newState, undoAction);
        } else if (motion.motionType === ActionMotionType.Untransform) {
            this.applyUntransformState(newState, undoAction);
        }
    }

    /**
     * Applies or reverses a transformation state change.
     */
    private applyTransformState(newState: TransformedState, undoAction: boolean): void {
        if (undoAction) {
            this.game.removeTransformedState(newState.characterId);
        } else {
            this.game.addTransformedState(newState.characterBefore, newState.characterAfter);
        }
    }

    /**
     * Applies or reverses an untransformation state change.
     */
    private applyUntransformState(newState: TransformedState, undoAction: boolean): void {
        // Undoing an "Untransform" action means retransforming the character (after -> before)
        if (undoAction) {
            this.game.addTransformedState(newState.characterAfter, newState.characterBefore);
        } else {
            this.game.removeTransformedState(newState.characterId);
        }
    }
}
