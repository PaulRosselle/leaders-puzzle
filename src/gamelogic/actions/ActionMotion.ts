import { ActionMotionType } from "./ActionMotionType";
import { ActionTarget } from "./ActionTarget";

export class ActionMotion {
    public readonly motionType: ActionMotionType;
    public readonly targets: readonly ActionTarget[];

    constructor(motionType: ActionMotionType, targets: readonly ActionTarget[]) {
        this.motionType = motionType;
        this.targets = [...targets];
    }
}