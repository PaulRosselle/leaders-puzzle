import { Character } from "../core/Character";
import { InteractionResult } from "./InteractionResult";
import { InteractionFeedback } from "./InteractionFeedback";
import { InteractionResultType } from "../../enums/interactions/InteractionResultType";

export class ActionBuilder {
    private readonly sourceCharacter: Character;

    private readonly interactionResults: InteractionResult[];
    private readonly interactionFeedbacks: InteractionFeedback[];

    constructor(sourceCharacter: Character,
                interactionResults: readonly InteractionResult[] = [],
                interactionFeedbacks: readonly InteractionFeedback[] = []) {
        this.sourceCharacter = sourceCharacter;
        this.interactionResults = [...interactionResults];
        this.interactionFeedbacks = [...interactionFeedbacks];
    }

    static copy(builder: ActionBuilder): ActionBuilder {
        return new ActionBuilder(builder.sourceCharacter, builder.getResults(), builder.getFeedbacks());
    }

    getSourceCharacter(): Character {
        return this.sourceCharacter;
    }

    getResults(): readonly InteractionResult[] {
        return this.interactionResults;
    }

    getFeedbacks(): readonly InteractionFeedback[] {
        return this.interactionFeedbacks;
    }

    addResult(result: InteractionResult): void {
        this.interactionResults.push(result);
    }

    addFeedback(feedback: InteractionFeedback): void {
        this.interactionFeedbacks.push(feedback);
    }

    isBuildCancelled(): boolean {
        return this.interactionResults.some(
            result => result.getResultType() === InteractionResultType.CancelAction
        );
    }
}
