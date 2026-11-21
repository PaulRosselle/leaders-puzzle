import { CharacterId } from './CharacterId'
import { HighlightStatus } from './HighlightStatus'
import type { MarkerData } from './MarkerData'
import { MarkerType } from './MarkerType'
import type { PieceData } from './PieceData'
import { Team } from './Team'

export const DEMO_PIECES: PieceData[] = [
  { id: 'white-leader', character: CharacterId.LeaderKing, team: Team.White, position: { q: -3, r: -0 }, highlightStatus: HighlightStatus.Disabled },
  { id: 'black-leader', character: CharacterId.LeaderQueen, team: Team.Black, position: { q: 3, r: 0 }, highlightStatus: HighlightStatus.Enabled },
  { id: 'white-1', character: CharacterId.Assassin, team: Team.White, position: { q: 0, r: 1 }, highlightStatus: HighlightStatus.Disabled },
  { id: 'black-1', character: CharacterId.Acrobat, team: Team.Black, position: { q: 1, r: 1 }, highlightStatus: HighlightStatus.Enabled },
  { id: 'black-1', character: CharacterId.Bruiser, team: Team.White, position: { q: 2, r: -2 }, highlightStatus: HighlightStatus.Disabled },
  { id: 'black-1', character: CharacterId.Wisp, team: Team.Black, position: { q: -1, r: -1 }, highlightStatus: HighlightStatus.Enabled },
  { id: 'black-1', character: CharacterId.RoyalGuard, team: Team.White, position: { q: 0, r: 0 }, highlightStatus: HighlightStatus.Disabled },
]

export const DEMO_MARKERS: MarkerData[] = [
  { type: MarkerType.AbilityMovementTarget, position: { q: -1, r: 1 } },
  { type: MarkerType.AbilityMovementTarget, position: { q: 1, r: -1 } },
]
