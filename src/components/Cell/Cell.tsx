import type { Position } from '../../gamelogic/entities/core/Position'
import { cellStyle } from '../../utils/cellStyle'
import './Cell.css'

type CellProps = {
  position: Position
}

export function Cell({ position }: CellProps) {
  return <div className="cell" style={cellStyle(position)} />
}
