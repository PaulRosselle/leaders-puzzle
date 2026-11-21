import { MarkerType } from './MarkerType'

import targetMovement from '../assets/markers/target_movement.webp'
import targetAbilityCharacter from '../assets/markers/target_ability_character.webp'
import targetAbilityMovement from '../assets/markers/target_ability_movement.webp'

export const MARKER_IMAGES: Record<MarkerType, string> = {
  [MarkerType.MovementTarget]: targetMovement,
  [MarkerType.AbilityCharacterTarget]: targetAbilityCharacter,
  [MarkerType.AbilityMovementTarget]: targetAbilityMovement,
}
