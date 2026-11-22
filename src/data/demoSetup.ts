import { Position } from '../gamelogic/entities/core/Position'
import { CharacterType } from '../gamelogic/enums/CharacterType'
import { Team } from '../gamelogic/enums/Team'
import { HighlightStatus } from './HighlightStatus'
import type { MarkerData } from './MarkerData'
import { MarkerType } from './MarkerType'
import type { PieceData } from './PieceData'

export const DEMO_PIECES: PieceData[] = [
  { id: 'white-leader', character: CharacterType.LeaderKing, team: Team.White, position: Position.fromAxial(-3, 0, 3), highlightStatus: HighlightStatus.Disabled },
  { id: 'black-leader', character: CharacterType.LeaderQueen, team: Team.Black, position: Position.fromAxial(3, 0, -3), highlightStatus: HighlightStatus.Enabled },
  { id: 'white-1', character: CharacterType.Assassin, team: Team.White, position: Position.fromAxial(0, 1, -1), highlightStatus: HighlightStatus.Disabled },
  { id: 'black-1', character: CharacterType.Acrobat, team: Team.Black, position: Position.fromAxial(1, 1, -2), highlightStatus: HighlightStatus.Enabled },
  { id: 'white-2', character: CharacterType.Bruiser, team: Team.White, position: Position.fromAxial(2, -2, 0), highlightStatus: HighlightStatus.Disabled },
  { id: 'black-2', character: CharacterType.Wisp, team: Team.Black, position: Position.fromAxial(-1, -1, 2), highlightStatus: HighlightStatus.Enabled },
  { id: 'white-3', character: CharacterType.RoyalGuard, team: Team.White, position: Position.fromAxial(0, 0, 0), highlightStatus: HighlightStatus.Disabled },
]

export const DEMO_MARKERS: MarkerData[] = [
{ type: MarkerType.AbilityMovementTarget, position: Position.fromAxial(-1, 1, 0) },
{ type: MarkerType.AbilityMovementTarget, position: Position.fromAxial(1, -1, 0) },
]
