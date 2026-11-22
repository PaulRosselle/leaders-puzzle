import {
  CHARACTER_ILLUSTRATIONS,
  HIGHLIGHT,
  LEADER_OUTLINE,
  PIECE_BACKGROUNDS,
} from '../../data/CharacterAsset'
import type { PieceData } from '../../data/PieceData'
import { cellStyle } from '../../utils/cellStyle'
import './CharacterPiece.css'
import '../Cell/Cell.css'
import { HighlightStatus } from '../../data/HighlightStatus'
import { Team } from '../../gamelogic/enums/Team'
import { CharacterType } from '../../gamelogic/enums/CharacterType'

type CharacterPieceProps = {
  piece: PieceData
}

export function CharacterPiece({ piece }: CharacterPieceProps) {
  const { character, team, position, highlightStatus } = piece
  const isHighlighted = highlightStatus !== HighlightStatus.Disabled
  const isAnimated = highlightStatus === HighlightStatus.Animated

  return (
    <div className="character-piece cell" style={cellStyle(position)}>
      {isHighlighted && (
        <img
          className={`character-piece__highlight ${isAnimated ? 'character-piece__highlight--animated' : ''}`}
          src={HIGHLIGHT}
          alt={HighlightStatus[highlightStatus]}
        />
      )}
      <div className={`character-piece__content ${isHighlighted ? 'character-piece__content--highlighted' : ''}`}>
        <img
          className="character-piece__layer"
          src={PIECE_BACKGROUNDS[team]}
          alt={Team[team]}
        />
        {CharacterType.isLeader(character) && (
          <img className="character-piece__layer" src={LEADER_OUTLINE} alt="" />
        )}
        <img
          className="character-piece__layer"
          src={CHARACTER_ILLUSTRATIONS[character]}
          alt={CharacterType[character]}
        />
      </div>
    </div>
  )
}
