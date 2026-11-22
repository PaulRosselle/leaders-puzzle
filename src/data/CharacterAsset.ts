import bgWhite from '../assets/pieces/character_piece_bg_white.webp'
import bgBlack from '../assets/pieces/character_piece_bg_black.webp'
import outlineLeader from '../assets/pieces/character_piece_outline_leader.webp'
import highlight from '../assets/highlights/character_piece_highlight_default.webp'
import { Team } from '../gamelogic/enums/Team'
import { CharacterType } from '../gamelogic/enums/CharacterType'

/** Team background resource name. */
export const PIECE_BACKGROUNDS: Record<Team, string> = {
  [Team.White]: bgWhite,
  [Team.Black]: bgBlack,
}

/** Outline resource name for leaders and alternative skins. */
export const LEADER_OUTLINE: string = outlineLeader

/** Highlight resource name. */
export const HIGHLIGHT: string = highlight

/** Mapping between a CharacterType and its character_piece resource name. */
export const CHARACTER_ASSETS: Record<CharacterType, string> = {
    [CharacterType.Acrobat]: 'acrobat',
    [CharacterType.Archer]: 'archer',
    [CharacterType.Assassin]: 'assassin',
    [CharacterType.Brewmaster]: 'brewmaster',
    [CharacterType.Bruiser]: 'bruiser',
    [CharacterType.ClawLauncher]: 'claw_launcher',
    [CharacterType.Cub]: 'cub',
    [CharacterType.Hermit]: 'hermit',
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
}

/**
 * Automatic import of each character piece illustration.
 */
const files = import.meta.glob<string>('../assets/pieces/character_piece_*.webp', {
  eager: true,
  import: 'default',
})

export const CHARACTER_ILLUSTRATIONS: Record<CharacterType, string> = {} as Record<CharacterType, string>

for (const [id, asset] of Object.entries(CHARACTER_ASSETS)) {
  const path = `../assets/pieces/character_piece_${asset}.webp`
    const illustration = files[path]

    if (illustration) {
        CHARACTER_ILLUSTRATIONS[Number(id) as CharacterType] = illustration
    }
}