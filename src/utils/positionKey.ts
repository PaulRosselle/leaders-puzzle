import type { Position } from '../gamelogic/entities/core/Position'

/**
 * Builds a unique string key for a position ("q,r").
 * Used as the key of Maps and as the React `key` prop.
 */
export function positionKey(position: Position): string {
  return `${position.getQ()},${position.getR()}`
}