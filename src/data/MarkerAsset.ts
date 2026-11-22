import { MarkerType } from './MarkerType'

import { InteractionTargetType } from '../gamelogic/enums/interactions/InteractionTargetType'
import type { MarkerData } from './MarkerData'

import targetMovement from '../assets/markers/target_movement.webp'
import targetAbilityCharacter from '../assets/markers/target_ability_character.webp'
import targetAbilityMovement from '../assets/markers/target_ability_movement.webp'
import type { InteractionRequest } from '../gamelogic/entities/interactions/InteractionRequest'
import type { GameContext } from '../gamelogic/entities/states/GameContext'
import type { Position } from '../gamelogic/entities/core/Position'
import { angleBetween } from '../utils/hexGeometry'

export const MARKER_IMAGES: Record<MarkerType, string> = {
    [MarkerType.MovementTarget]: targetMovement,
    [MarkerType.AbilityCharacterTarget]: targetAbilityCharacter,
    [MarkerType.AbilityMovementTarget]: targetAbilityMovement,
}

/**
 * Marker displayed for each kind of target (null = nothing to display).
 * Typed as a Record so the compiler complains if a new InteractionTargetType
 * is added without updating this mapping.
 */
const MARKER_BY_TARGET_TYPE: Record<InteractionTargetType, MarkerType | null> = {
    // The user is expected to click on a character: no marker needed.
    [InteractionTargetType.PlayableCharacterPosition]: null,
    [InteractionTargetType.MovementDestination]: MarkerType.MovementTarget,
    [InteractionTargetType.ActiveAbilityDestination]: MarkerType.AbilityMovementTarget,
    [InteractionTargetType.ActiveAbilityTargetPosition]: MarkerType.AbilityCharacterTarget,
}

/**
 * Position of the character the player just clicked on
 * (the target character of the request context).
 */
function findOriginPosition(request: InteractionRequest, gameContext: GameContext): Position | null {
    const characterId = request.getContext().getNonNullTargetCharacter().id

    const state = gameContext.getCharacterStates()
        .find((characterState) => characterState.getCharacter().id === characterId)

    return state?.getPosition() ?? null
}

/** Builds the markers to display from the legal targets of a request. */
export function createMarkers(
    request: InteractionRequest | null,
    gameContext: GameContext | null,
): MarkerData[] {
    if (request === null || gameContext === null) {
        return []
    }

    const markers: MarkerData[] = []

    // Only looked up when needed: the target character does not exist
    // for every kind of request (e.g. when choosing a character).
    let origin: Position | null | undefined = undefined

    for (const target of request.getLegalTargets()) {
        const type = target.getTargetType()
        const markerType = MARKER_BY_TARGET_TYPE[type]

        if (markerType === null) {
            continue
        }

        const position = target.getChosenPosition()
        const marker: MarkerData = { type: markerType, position }

        if (type === InteractionTargetType.MovementDestination) {
            if (origin === undefined) {
                origin = findOriginPosition(request, gameContext)
            }
            // The marker points away from the moving character.
            if (origin !== null) {
                marker.rotation = angleBetween(origin, position)
            }
        }

        markers.push(marker)
    }

    return markers
}