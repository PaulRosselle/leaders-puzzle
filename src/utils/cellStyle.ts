import type { CSSProperties } from 'react'
import type { Position } from '../gamelogic/entities/core/Position'

export function cellStyle(position: Position): CSSProperties {
  return { '--q': position.getQ(), '--r': position.getR() } as CSSProperties
}