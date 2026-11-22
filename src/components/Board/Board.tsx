import boardImage from '../../assets/board.webp'
import { BOARD_CELLS } from '../../data/BoardCells'
import type { MarkerData } from '../../data/MarkerData'
import type { PieceData } from '../../data/PieceData'
import { positionKey } from '../../data/positionKey'
import type { InteractionTarget } from '../../gamelogic/entities/interactions/InteractionTarget'
import { Cell } from '../Cell/Cell'
import { CharacterPiece } from '../CharacterPiece/CharacterPiece'
import { Marker } from '../Marker/Marker'
import './Board.css'

type BoardProps = {
  pieces: PieceData[]
  markers: MarkerData[]
  /** Legal targets of the current request, indexed by positionKey. */
  targetsByPosition: Map<string, InteractionTarget>
  onSelectTarget: (target: InteractionTarget) => void
}

export function Board({ pieces, markers, targetsByPosition, onSelectTarget }: BoardProps) {
  return (
    <div className="board">
      <div className="board__stage">
        <img className="board__image" src={boardImage} alt="" />

        {BOARD_CELLS.map((position) => {
          const key = positionKey(position)
          const target = targetsByPosition.get(key)

          return (
            <Cell
              key={key}
              position={position}
              // Only legal targets get a click handler.
              onSelect={target ? () => onSelectTarget(target) : undefined}
            />
          )
        })}

        {pieces.map((piece) => (
          <CharacterPiece key={piece.id} piece={piece} />
        ))}

        {markers.map((marker) => (
          <Marker key={`${marker.type}:${positionKey(marker.position)}`} marker={marker} />
        ))}
      </div>
    </div>
  )
}