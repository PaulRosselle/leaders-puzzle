import type { Position } from '../gamelogic/entities/core/Position'
import type { Team } from '../gamelogic/enums/Team'
import type { CharacterId } from './CharacterId'
import type { HighlightStatus } from './HighlightStatus'

/** Board character piece representation. */
export type PieceData = {
  id: string
  character: CharacterId
  team: Team
  position: Position
  highlightStatus: HighlightStatus
}
