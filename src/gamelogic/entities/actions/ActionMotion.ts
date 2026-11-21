import { ActionMotionType } from "../../enums/ActionMotionType";
import { ActionTarget } from "./ActionTarget";

export class ActionMotion {
    public readonly motionType: ActionMotionType;
    public readonly targets: readonly ActionTarget[];

    public constructor(motionType: ActionMotionType, targets: readonly ActionTarget[]) {
        this.motionType = motionType;
        this.targets = [...targets];

        Object.freeze(this);
    }
}