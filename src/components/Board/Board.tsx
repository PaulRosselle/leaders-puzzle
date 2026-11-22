import boardImage from '../../assets/board.webp'
import { BOARD_CELLS } from '../../data/BoardCells'
import type { MarkerData } from '../../data/MarkerData'
import type { PieceData } from '../../data/PieceData'
import { Cell } from '../Cell/Cell'
import { CharacterPiece } from '../CharacterPiece/CharacterPiece'
import { Marker } from '../Marker/Marker'
import './Board.css'

type BoardProps = {
  pieces: PieceData[]
  markers: MarkerData[]
}

export function Board({ pieces, markers }: BoardProps) {
  return (
    <div className="board">
      <div className="board__stage">
        <img className="board__image" src={boardImage} alt="" />

        {BOARD_CELLS.map((position) => (
          <Cell key={`${position.getQ},${position.getR}`} position={position} />
        ))}

        {pieces.map((piece) => (
          <CharacterPiece key={piece.id} piece={piece} />
        ))}

        {markers.map((marker) => (
          <Marker
            key={`${marker.type}:${marker.position.getQ},${marker.position.getR}`}
            marker={marker}
          />
        ))}
      </div>
    </div>
  )
}
