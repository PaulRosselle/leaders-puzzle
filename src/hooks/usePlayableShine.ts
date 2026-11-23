import { useEffect } from 'react'
import { runShineCycles, stopShine } from '../animation/ShineAnimation'
import type { InteractionRequest } from '../gamelogic/entities/interactions/InteractionRequest'
import { InteractionRequestType } from '../gamelogic/enums/interactions/InteractionRequestType'

/**
 * Equivalent of startPlayableCharactersShineAnimation: restarted on every new
 * request, only active for PlayableCharacterExpected.
 * `orderedIds` must already be sorted in the order of the shine.
 */
export function usePlayableShine(request: InteractionRequest | null, orderedIds: readonly string[], enabled: boolean): void {
  // Stable key: no restart when the array is recreated with the same content.
  const idsKey = orderedIds.join(',')

  useEffect(() => {
    if (!enabled || request?.getRequestType() !== InteractionRequestType.PlayableCharacterExpected || idsKey === '') {
      return
    }

    const ids = idsKey.split(',')
    const controller = new AbortController()
    void runShineCycles(ids, controller.signal)

    // Equivalent of stopPlayableCharactersShineAnimation.
    return () => {
      controller.abort()
      ids.forEach((id) => stopShine(id))
    }
  }, [request, idsKey, enabled])
}