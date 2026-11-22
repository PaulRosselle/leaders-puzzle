
import { ActionMotion } from "../entities/actions/ActionMotion";
import { ActionTarget } from "../entities/actions/ActionTarget";
import { Character } from "../entities/core/Character";
import { CharacterPath } from "../entities/core/CharacterPath";
import { Position } from "../entities/core/Position";

import { ActionMotionType } from "../enums/ActionMotionType";

import { ActionBuilder } from "../entities/interactions/ActionBuilder";
import { InteractionContext } from "../entities/interactions/InteractionContext";
import { InteractionFeedback } from "../entities/interactions/InteractionFeedback";
import { InteractionRequest } from "../entities/interactions/InteractionRequest";
import { InteractionResult } from "../entities/interactions/InteractionResult";
import { InteractionTarget } from "../entities/interactions/InteractionTarget";
import type { InteractionTargetType } from "../enums/interactions/InteractionTargetType";
import { InteractionResultType } from "../enums/interactions/InteractionResultType";
import type { Cell } from "../entities/projection/Cell";
import { InteractionRequestType } from "../enums/interactions/InteractionRequestType";

export class ResolverQuery {
    private constructor() {
        throw new Error("Cannot instantiate utility class");
    }

    static isValidResult(result: InteractionResult, validType: InteractionTargetType): boolean {
        const target = result.getChosenTarget();

        return (
            result.getResultType() === InteractionResultType.PositionChosen &&
            target !== null &&
            target.getTargetType() === validType
        );
    }

    static getChosenPosition(result: InteractionResult): Position {
        return result.getNonNullChosenTarget().getChosenPosition();
    }

    static createPositionResult(context: InteractionContext, 
                                targetType: InteractionTargetType,
                                position: Position): InteractionResult {
        return new InteractionResult(
            InteractionResultType.PositionChosen,
            context,
            new InteractionTarget(targetType, position)
        );
    }

    static addTargets(targets: InteractionTarget[],
                      targetType: InteractionTargetType,
                      positions: readonly Position[]): void {
        for (const position of positions) {
            targets.push(new InteractionTarget(targetType, position));
        }
    }

    static getPositions(cells: readonly Cell[]): Position[] {
        return cells.map(cell => cell.getPosition());
    }

    static createPositionRequest(context: InteractionContext,
                                 targets: readonly InteractionTarget[]): InteractionRequest {
        return new InteractionRequest(
            InteractionRequestType.PositionExpected,
            context,
            targets,
            [InteractionResultType.PositionChosen, InteractionResultType.CancelAction]
        );
    }

    static isFeedbackExpected(builder: ActionBuilder): boolean {
        return (
            builder.getResults().length > 0 &&
            builder.getFeedbacks().length === 0 &&
            !builder.isBuildCancelled()
        );
    }

    static createMotionFeedback(type: ActionMotionType, ...targets: ActionTarget[]): InteractionFeedback {
        return new InteractionFeedback([new ActionMotion(type, targets)]);
    }

    static createSingleMotionFeedback(type: ActionMotionType,
                                      character: Character,
                                      from: Position,
                                      to: Position): InteractionFeedback {
        return this.createMotionFeedback(type, new ActionTarget(character, from, to));
    }

    static createPathFeedback(character: Character, path: CharacterPath, motionType: ActionMotionType): InteractionFeedback {
        if (path.getStepsCount() > 2) {
            throw new Error(`Invalid ${motionType} path: path should not exceed two steps`);
        }

        const motions: ActionMotion[] = [];
        let previousPosition = path.getStart();

        for (const position of path.getPositions()) {
            if (!position.equals(path.getStart())) {
                motions.push(
                    new ActionMotion(motionType, [
                        new ActionTarget(character, previousPosition, position)
                    ])
                );

                previousPosition = position;
            }
        }

        return new InteractionFeedback(motions);
    }
}