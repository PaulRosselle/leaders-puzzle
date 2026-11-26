import { memo } from 'react'
import type { MouseEvent } from 'react'
import type { Position } from '../../gamelogic/entities/core/Position'
import type { InteractionTarget } from '../../gamelogic/entities/interactions/InteractionTarget'
import { cellStyle } from '../../utils/cellStyle'
import './Cell.css'

type CellProps = {
  position: Position
  /** Defined only if this cell is a legal target of the current request. */
  target?: InteractionTarget
  /** Stable callback (no closure created per cell, so the memo below works). */
  onSelectTarget: (target: InteractionTarget) => void
  label?: string
}

/**
 * Memoized: a cell is only rendered again when its target, its label or the
 * callback change, not on every motion of an animation.
 */
export const Cell = memo(function Cell({ position, target, onSelectTarget, label }: CellProps) {
  const isTargetable = target !== undefined

  const handleClick = (event: MouseEvent) => {
    // Prevents the click from bubbling up to the board (which will cancel the action).
    event.stopPropagation()
    if (target !== undefined) onSelectTarget(target)
  }

  return (
    <div
      className={`cell ${isTargetable ? 'cell--targetable' : ''}`}
      style={cellStyle(position)}
      onClick={isTargetable ? handleClick : undefined}>
        {label && <span className="cell__label">{label}</span>}
    </div>
  )
})