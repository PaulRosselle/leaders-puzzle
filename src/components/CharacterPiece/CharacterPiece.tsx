import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CHARACTER_ASSETS,
  CHARACTER_ILLUSTRATIONS,
  LEADER_OUTLINE,
  PIECE_BACKGROUNDS,
} from '../../data/asset/CharacterAsset'
import { HIGHLIGHT_OUTLINES } from '../../data/asset/HighlightAsset'
import type { PieceData } from '../../data/PieceData'
import { cellStyle } from '../../utils/cellStyle'
import './CharacterPiece.css'
import '../Cell/Cell.css'
import { HighlightStatus } from '../../data/highlight/HighlightStatus'
import { Team } from '../../gamelogic/enums/Team'
import { CharacterType } from '../../gamelogic/enums/CharacterType'
import { useLongPress } from '../../hooks/useLongPress'
import type { HighlightColor } from '../../data/highlight/HighlightColor'

type CharacterPieceProps = {
  piece: PieceData
  highlightColor: HighlightColor
  /** Defined only if this piece's position is a legal target of the current request. */
  onSelect?: () => void
  /** Called after a long press (or a right click) on the piece. */
  onLongPress?: () => void
}

type PieceLayersProps = {
  character: CharacterType
  team: Team
}

/** Key of each team in the translations (`pieces.team.<key>`). */
const TEAM_KEYS = {
  [Team.White]: 'white',
  [Team.Black]: 'black',
} as const satisfies Record<Team, string>

/** Team background, leader outline and illustration of a character. */
function PieceLayers({ character, team }: PieceLayersProps) {
  const { t } = useTranslation('pieces')

  return (
    <>
      <img className="character-piece__layer" src={PIECE_BACKGROUNDS[team]} alt={t(`team.${TEAM_KEYS[team]}`)} />
      {CharacterType.isLeader(character) && (
        <img className="character-piece__layer" src={LEADER_OUTLINE} alt="" />
      )}
      <img
        className="character-piece__layer"
        src={CHARACTER_ILLUSTRATIONS[character]}
        alt={t(`characters.${CHARACTER_ASSETS[character]}.name`)}
      />
    </>
  )
}

export function CharacterPiece({ piece, highlightColor, onSelect, onLongPress }: CharacterPieceProps) {
  const { t } = useTranslation('pieces')
  const { character, team, position, highlightStatus, transformedCharacter } = piece
  const isHighlighted = highlightStatus !== HighlightStatus.Disabled
  const isAnimated = highlightStatus === HighlightStatus.Animated
  const isTargetable = onSelect !== undefined

  const { handlers: longPressHandlers, consumeLongPress } = useLongPress(onLongPress)

  const handleClick = (event: MouseEvent) => {
    // The click that ends a long press is ignored: it must neither select the
    // piece nor reach the board (which would cancel the action).
    if (consumeLongPress()) {
      event.stopPropagation()
      return
    }

    // Not a legal target: the click bubbles up to the board, which cancels the action.
    if (!isTargetable) {
      return
    }

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
      {...longPressHandlers}
      onClick={handleClick}
    >
      {isHighlighted && (
        <img
          className={`character-piece__highlight ${isAnimated ? 'character-piece__highlight--animated' : ''}`}
          src={HIGHLIGHT_OUTLINES[highlightColor]}
          alt={t(isAnimated ? 'highlight.selected' : 'highlight.playable')}
        />
      )}
      <div className={`character-piece__content ${isHighlighted ? 'character-piece__content--highlighted' : ''}`}>
        <PieceLayers character={character} team={team} />
      </div>
      {isHighlighted && (
        <div className="character-piece__shine">
          <span className="character-piece__shine-band" />
        </div>
      )}
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