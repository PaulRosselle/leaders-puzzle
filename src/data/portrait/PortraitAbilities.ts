import { AbilityType } from '../../gamelogic/enums/AbilityType'
import { CharacterType } from '../../gamelogic/enums/CharacterType'
import { getPortraitCharacterTypes, type CharacterPortrait } from './CharacterPortrait'

/** Ability icon displayed after the name of a character. */
export type PortraitAbility = 'leader' | 'active' | 'passive' | 'special'

const ABILITY_NAMES = {
  [AbilityType.Active]: 'active',
  [AbilityType.Passive]: 'passive',
  [AbilityType.Special]: 'special',
} as const satisfies Record<AbilityType, string>

/**
 * Abilities of a portrait: the Leader icon first, then the abilities of its
 * characters in the order of the AbilityType enum, without duplicates
 * (the Hermit and the Cub only give one "special").
 */
export function getPortraitAbilities(portrait: CharacterPortrait): PortraitAbility[] {
  const characterTypes = getPortraitCharacterTypes(portrait)

  const abilityTypes = new Set<AbilityType>(
    characterTypes.flatMap((characterType) => CharacterType.getCharacterTypes(characterType)),
  )
  const abilities = [...abilityTypes].sort((a, b) => a - b).map((abilityType) => ABILITY_NAMES[abilityType])

  return characterTypes.some((characterType) => CharacterType.isLeader(characterType))
    ? ['leader', ...abilities] : abilities
}