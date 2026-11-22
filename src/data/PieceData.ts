import type { Position } from '../gamelogic/entities/core/Position'
import type { CharacterId } from './CharacterId'
import type { HighlightStatus } from './HighlightStatus'
import type { Team } from './Team'

/** Board character piece representation. */
export type PieceData = {
  id: string
  character: CharacterId
  team: Team
  position: Position
  highlightStatus: HighlightStatus
}
