import { ActionMotion } from "../actions/ActionMotion";

export class InteractionFeedback {
    public readonly actionMotions: readonly ActionMotion[];

    public constructor(actionMotions: readonly ActionMotion[]) {
        this.actionMotions = Object.freeze([...actionMotions]);

        Object.freeze(this);
    }
}