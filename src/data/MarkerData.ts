import type { Position } from '../gamelogic/entities/core/Position'
import type { MarkerType } from './MarkerType'

/** Action marker displayed above a cell or a character. */
export type MarkerData = {
  type: MarkerType
  position: Position
}
