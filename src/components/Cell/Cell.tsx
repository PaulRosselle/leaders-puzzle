import type { MouseEvent } from 'react'
import type { Position } from '../../gamelogic/entities/core/Position'
import { cellStyle } from '../../utils/cellStyle'
import './Cell.css'

type CellProps = {
  position: Position
  /** Defined only if this cell is a legal target of the current request. */
  onSelect?: () => void
  label?: string
}

export function Cell({ position, onSelect, label }: CellProps) {
  const isTargetable = onSelect !== undefined

  const handleClick = (event: MouseEvent) => {
    // Prevents the click from bubbling up to the board (which will cancel the action).
    event.stopPropagation()
    onSelect?.()
  }

  return (
    <div
      className={`cell ${isTargetable ? 'cell--targetable' : ''}`}
      style={cellStyle(position)}
      onClick={isTargetable ? handleClick : undefined}>
        {label && <span className="cell__label">{label}</span>}
    </div>
  )
}