import { InteractionResultType } from "../../enums/interactions/InteractionResultType";
import type { InteractionContext } from "./InteractionContext";
import type { InteractionTarget } from "./InteractionTarget";

/**
 * Response returned by the external caller in reply to an InteractionRequest.
 *
 * Carries the response type and, depending on that type, an optional chosen value.
 */
export class InteractionResult {
    private readonly resultType: InteractionResultType;
    private readonly context: InteractionContext;
    private readonly chosenTarget: InteractionTarget | null;

    /**
     * Creates an interaction result.
     *
     * The interaction context is always required because every result
     * is associated with the interaction to which the caller is responding.
     *
     * The chosen target is optional because some result types,
     * such as CancelAction, do not involve selecting a target.
     *
     * @param resultType The type of response provided by the caller.
     * @param context The context of the interaction being answered.
     * @param chosenTarget The selected target, if applicable.
     */
    public constructor(resultType: InteractionResultType,
                       context: InteractionContext,
                       chosenTarget: InteractionTarget | null) {
        this.resultType = resultType;
        this.context = context;
        this.chosenTarget = chosenTarget;

        Object.freeze(this);
    }

    public getResultType(): InteractionResultType {
        return this.resultType;
    }

    public getContext(): InteractionContext {
        return this.context;
    }

    public getChosenTarget(): InteractionTarget | null {
        return this.chosenTarget;
    }

    public getNonNullChosenTarget(): InteractionTarget {
        if (this.chosenTarget === null) {
            throw new Error("No target found within interaction result");
        }
        return this.chosenTarget;
    }
}