import type { Position } from '../gamelogic/entities/core/Position'
import type { MarkerType } from './MarkerType'

/** Action marker displayed above a cell or a character. */
export type MarkerData = {
  type: MarkerType
  position: Position
  /** Clockwise rotation in degrees (0 = default orientation of the image). */
  rotation?: number
}