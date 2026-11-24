import { CharacterType } from '../gamelogic/enums/CharacterType'

/**
 * Mapping between a CharacterType and its portrait name. This name is the
 * file name of the portrait (`assets/portraits/portrait_<name>`) and the key
 * of its title in the translations (`portraits.names.<name>`).
 *
 * The Hermit and the Cub share the same portrait.
 */
export const CHARACTER_PORTRAITS = {
  [CharacterType.Acrobat]: 'acrobat',
  [CharacterType.Archer]: 'archer',
  [CharacterType.Assassin]: 'assassin',
  [CharacterType.Brewmaster]: 'brewmaster',
  [CharacterType.Bruiser]: 'bruiser',
  [CharacterType.ClawLauncher]: 'claw_launcher',
  [CharacterType.Cub]: 'hermit_and_cub',
  [CharacterType.Hermit]: 'hermit_and_cub',
  [CharacterType.Illusionist]: 'illusionist',
  [CharacterType.Jailer]: 'jailer',
  [CharacterType.LeaderKing]: 'leader_king',
  [CharacterType.LeaderQueen]: 'leader_queen',
  [CharacterType.Manipulator]: 'manipulator',
  [CharacterType.Nemesis]: 'nemesis',
  [CharacterType.Protector]: 'protector',
  [CharacterType.Rider]: 'rider',
  [CharacterType.RoyalGuard]: 'royal_guard',
  [CharacterType.Vizier]: 'vizier',
  [CharacterType.Wanderer]: 'wanderer',
  [CharacterType.LeaderVermilion]: 'leader_vermilion',
  [CharacterType.Shaman]: 'shaman',
  [CharacterType.Frog]: 'frog',
  [CharacterType.Sniper]: 'sniper',
  [CharacterType.Tactician]: 'tactician',
  [CharacterType.Wisp]: 'wisp',
  [CharacterType.EliteArcher]: 'elite_archer',
} as const satisfies Record<CharacterType, string>

/** Name of a portrait ("claw_launcher", "hermit_and_cub"...). */
export type CharacterPortrait = (typeof CHARACTER_PORTRAITS)[CharacterType]

const LEADER_PORTRAITS = ['leader_king', 'leader_queen', 'leader_vermilion'] as const
type LeaderPortrait = (typeof LEADER_PORTRAITS)[number]

/**
 * Key of a description in the translations (`portraits.descriptions.<key>`).
 * The three leaders have their own portrait but share the same description.
 */
export type PortraitDescriptionKey = Exclude<CharacterPortrait, LeaderPortrait> | 'leader'

function isLeaderPortrait(portrait: CharacterPortrait): portrait is LeaderPortrait {
  return (LEADER_PORTRAITS as readonly string[]).includes(portrait)
}

export function getDescriptionKey(portrait: CharacterPortrait): PortraitDescriptionKey {
  return isLeaderPortrait(portrait) ? 'leader' : portrait
}

const PORTRAIT_CHARACTER_TYPES = new Map<CharacterPortrait, CharacterType[]>()

for (const [key, portrait] of Object.entries(CHARACTER_PORTRAITS)) {
  const characterTypes = PORTRAIT_CHARACTER_TYPES.get(portrait) ?? []
  characterTypes.push(Number(key) as CharacterType)
  PORTRAIT_CHARACTER_TYPES.set(portrait, characterTypes)
}

/** Characters sharing a portrait (the Hermit and the Cub, for example). */
export function getPortraitCharacterTypes(portrait: CharacterPortrait): readonly CharacterType[] {
  return PORTRAIT_CHARACTER_TYPES.get(portrait) ?? []
}