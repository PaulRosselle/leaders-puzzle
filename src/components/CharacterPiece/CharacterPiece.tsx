import type { MouseEvent } from 'react'
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
  /** Defined only if this piece's position is a legal target of the current request. */
  onSelect?: () => void
}

type PieceLayersProps = {
  character: CharacterType
  team: Team
}

/** Team background, leader outline and illustration of a character. */
function PieceLayers({ character, team }: PieceLayersProps) {
  return (
    <>
      <img className="character-piece__layer" src={PIECE_BACKGROUNDS[team]} alt={Team[team]} />
      {CharacterType.isLeader(character) && (
        <img className="character-piece__layer" src={LEADER_OUTLINE} alt="" />
      )}
      <img
        className="character-piece__layer"
        src={CHARACTER_ILLUSTRATIONS[character]}
        alt={CharacterType[character]}
      />
    </>
  )
}

export function CharacterPiece({ piece, onSelect }: CharacterPieceProps) {
  const { character, team, position, highlightStatus, transformedCharacter } = piece
  const isHighlighted = highlightStatus !== HighlightStatus.Disabled
  const isAnimated = highlightStatus === HighlightStatus.Animated
  const isTargetable = onSelect !== undefined

  const handleClick = (event: MouseEvent) => {
    // Prevents the click from bubbling up to the board (which would cancel the action).
    event.stopPropagation()
    onSelect?.()
  }

  return (
    <div
      className={`character-piece cell
        ${isTargetable ? 'character-piece--targetable' : ''}
        ${isHighlighted || isAnimated ? 'character-piece--highlighted' : ''}`}
      data-piece-id={piece.id}
      style={cellStyle(position)}
      onClick={isTargetable ? handleClick : undefined}
    >
      {isHighlighted && (
        <img
          className={`character-piece__highlight ${isAnimated ? 'character-piece__highlight--animated' : ''}`}
          src={HIGHLIGHT}
          alt={HighlightStatus[highlightStatus]}
        />
      )}
      <div className={`character-piece__content ${isHighlighted ? 'character-piece__content--highlighted' : ''}`}>
        <PieceLayers character={character} team={team} />
      </div>
      {transformedCharacter !== null && (
        <div className="character-piece__transformed">
          <div className="character-piece__transformed-content">
            <PieceLayers
              character={transformedCharacter.characterType}
              team={transformedCharacter.team}
            />
          </div>
        </div>
      )}
    </div>
  )
}