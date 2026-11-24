import type { Position } from "../gamelogic/entities/core/Position";
import type { InteractionTarget } from "../gamelogic/entities/interactions/InteractionTarget";

/**
 * Returns the target closest to the reference position.
 * On equality, the first target of the list wins (same as the Java version).
 */
export function getClosestTarget(targets: readonly InteractionTarget[], refPosition: Position): InteractionTarget {
    if (targets.length === 0) {
        throw new Error("Cannot get the closest target from an empty target list");
    }

    let closestTarget = targets[0];
    let closestDistance = closestTarget.getChosenPosition().distanceTo(refPosition);

    for (let i = 1; i < targets.length; i++) {
        const distance = targets[i].getChosenPosition().distanceTo(refPosition);
        if (distance < closestDistance) {
            closestTarget = targets[i];
            closestDistance = distance;
        }
    }

    return closestTarget;
}