import boardImage from '../../assets/board.webp'
import { BOARD_CELLS } from '../../data/BoardCells'
import type { MarkerData } from '../../data/MarkerData'
import type { PieceData } from '../../data/PieceData'
import { positionKey } from '../../utils/positionKey'
import type { InteractionTarget } from '../../gamelogic/entities/interactions/InteractionTarget'
import { Cell } from '../Cell/Cell'
import { CharacterPiece } from '../CharacterPiece/CharacterPiece'
import { Marker } from '../Marker/Marker'
import './Board.css'
import { PositionLabelMapper } from '../../data/parser/PositionLabelMapper'

type BoardProps = {
  pieces: PieceData[]
  markers: MarkerData[]
  /** Legal targets of the current request, indexed by positionKey. */
  targetsByPosition: Map<string, InteractionTarget>
  onSelectTarget: (target: InteractionTarget) => void
  /** Called when the click is not caught by a legal target. */
  onCancel: () => void
  showCoordinates: boolean
}

export function Board({
  pieces,
  markers,
  targetsByPosition,
  onSelectTarget,
  onCancel,
  showCoordinates,
}: BoardProps) {
  return (
    // Legal targets call stopPropagation(), so any click that reaches this
    // handler happened outside of a legal target: it cancels the action.
    <div className="board" onClick={onCancel}>
      <div className="board__stage">
        <img className="board__image" src={boardImage} alt="" />

        {BOARD_CELLS.map((position) => {
          const key = positionKey(position)
          const target = targetsByPosition.get(key)

          return (
            <Cell
              key={key}
              position={position}
              onSelect={target ? () => onSelectTarget(target) : undefined}
              label={showCoordinates ? PositionLabelMapper.toLabel(position) : undefined} 
            />
          )
        })}

        {pieces.map((piece) => {
          // A piece is drawn above its cell, so it needs its own click handler.
          const target = targetsByPosition.get(positionKey(piece.position))

          return (
            <CharacterPiece
              key={piece.id}
              piece={piece}
              onSelect={target ? () => onSelectTarget(target) : undefined}
            />
          )
        })}

        {markers.map((marker) => (
          <Marker key={`${marker.type}:${positionKey(marker.position)}`} marker={marker} />
        ))}
      </div>
    </div>
  )
}