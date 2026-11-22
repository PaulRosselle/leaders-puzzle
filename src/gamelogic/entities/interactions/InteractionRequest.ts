import { InteractionRequestType } from "../../enums/interactions/InteractionRequestType";
import { InteractionResultType } from "../../enums/interactions/InteractionResultType";
import { InteractionContext } from "./InteractionContext";
import { InteractionTarget } from "./InteractionTarget";

export class InteractionRequest {
    private readonly requestType: InteractionRequestType;
    private readonly context: InteractionContext;
    private readonly legalTargets: readonly InteractionTarget[];
    private readonly legalResults: readonly InteractionResultType[];

    constructor(requestType: InteractionRequestType,
                context: InteractionContext,
                legalTargets: readonly InteractionTarget[],
                legalResults: readonly InteractionResultType[]) {
        this.requestType = requestType;
        this.context = context;
        this.legalTargets = Object.freeze([...legalTargets]);
        this.legalResults = Object.freeze([...legalResults]);

        Object.freeze(this);
    }

    getRequestType(): InteractionRequestType {
        return this.requestType;
    }

    getContext(): InteractionContext {
        return this.context;
    }

    getLegalTargets(): readonly InteractionTarget[] {
        return this.legalTargets;
    }

    getLegalResults(): readonly InteractionResultType[] {
        return this.legalResults;
    }
}
