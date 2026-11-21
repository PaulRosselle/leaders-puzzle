import type { MarkerType } from './MarkerType'
import type { Position } from './Position'

/** Action marker displayed above a cell or a character. */
export type MarkerData = {
  type: MarkerType
  position: Position
}
