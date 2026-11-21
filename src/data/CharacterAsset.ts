import { CharacterId } from './CharacterId'
import { Team } from './Team'

import bgWhite from '../assets/pieces/character_piece_bg_white.webp'
import bgBlack from '../assets/pieces/character_piece_bg_black.webp'
import outlineLeader from '../assets/pieces/character_piece_outline_leader.webp'
import highlight from '../assets/highlights/character_piece_highlight_default.webp'

/** Team background resource name. */
export const PIECE_BACKGROUNDS: Record<Team, string> = {
  [Team.White]: bgWhite,
  [Team.Black]: bgBlack,
}

/** Outline resource name for leaders and alternative skins. */
export const LEADER_OUTLINE: string = outlineLeader

/** Highlight resource name. */
export const HIGHLIGHT: string = highlight

/** Mapping between a CharacterId and its character_piece resource name. */
export const CHARACTER_ASSETS: Record<CharacterId, string> = {
    [CharacterId.Acrobat]: 'acrobat',
    [CharacterId.Archer]: 'archer',
    [CharacterId.Assassin]: 'assassin',
    [CharacterId.Brewmaster]: 'brewmaster',
    [CharacterId.Bruiser]: 'bruiser',
    [CharacterId.ClawLauncher]: 'claw_launcher',
    [CharacterId.Cub]: 'cub',
    [CharacterId.Hermit]: 'hermit',
    [CharacterId.Illusionist]: 'illusionist',
    [CharacterId.Jailer]: 'jailer',
    [CharacterId.LeaderKing]: 'leader_king',
    [CharacterId.LeaderQueen]: 'leader_queen',
    [CharacterId.Manipulator]: 'manipulator',
    [CharacterId.Nemesis]: 'nemesis',
    [CharacterId.Protector]: 'protector',
    [CharacterId.Rider]: 'rider',
    [CharacterId.RoyalGuard]: 'royal_guard',
    [CharacterId.Vizier]: 'vizier',
    [CharacterId.Wanderer]: 'wanderer',
    [CharacterId.LeaderVermilion]: 'leader_vermilion',
    [CharacterId.Shaman]: 'shaman',
    [CharacterId.Frog]: 'frog',
    [CharacterId.Sniper]: 'sniper',
    [CharacterId.Tactician]: 'tactician',
    [CharacterId.Wisp]: 'wisp',
    [CharacterId.EliteArcher]: 'elite_archer',
}

/**
 * Automatic import of each character piece illustration.
 */
const files = import.meta.glob<string>('../assets/pieces/character_piece_*.webp', {
  eager: true,
  import: 'default',
})

export const CHARACTER_ILLUSTRATIONS: Record<CharacterId, string> = {} as Record<CharacterId, string>

for (const [id, asset] of Object.entries(CHARACTER_ASSETS)) {
  const path = `../assets/pieces/character_piece_${asset}.webp`
    const illustration = files[path]

    if (illustration) {
        CHARACTER_ILLUSTRATIONS[Number(id) as CharacterId] = illustration
    }
}