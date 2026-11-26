import { memo } from 'react'
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
import type { Character } from '../../gamelogic/entities/core/Character'
import type { InteractionTarget } from '../../gamelogic/entities/interactions/InteractionTarget'

type CharacterPieceProps = {
  piece: PieceData
  highlightColor: HighlightColor
  /** Defined only if this piece's position is a legal target of the current request. */
  target?: InteractionTarget
  /** Stable callbacks (no closure created per piece, so the memo below works). */
  onSelectTarget: (target: InteractionTarget) => void
  /** Called after a long press (or a right click) on the piece. */
  onLongPress: (piece: PieceData) => void
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
const PieceLayers = memo(function PieceLayers({ character, team }: PieceLayersProps) {
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
})

function CharacterPieceView({ piece, highlightColor, target, onSelectTarget, onLongPress }: CharacterPieceProps) {
  const { t } = useTranslation('pieces')
  const { character, team, position, highlightStatus, transformedCharacter } = piece
  const isHighlighted = highlightStatus !== HighlightStatus.Disabled
  const isAnimated = highlightStatus === HighlightStatus.Animated
  const isTargetable = target !== undefined

  // The closure is only recreated when the piece is really rendered again;
  // useLongPress keeps the latest callback in a ref.
  const { handlers: longPressHandlers, consumeLongPress } = useLongPress(() => onLongPress(piece))

  const handleClick = (event: MouseEvent) => {
    // The click that ends a long press is ignored: it must neither select the
    // piece nor reach the board (which would cancel the action).
    if (consumeLongPress()) {
      event.stopPropagation()
      return
    }

    // Not a legal target: the click bubbles up to the board, which cancels the action.
    if (target === undefined) {
      return
    }

    // Prevents the click from bubbling up to the board (which would cancel the action).
    event.stopPropagation()
    onSelectTarget(target)
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

function sameCharacter(a: Character | null, b: Character | null): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  return a.id === b.id && a.characterType === b.characterType && a.team === b.team
}

/**
 * `createPieceData` creates new PieceData objects at every render of the app,
 * so the comparison is made field by field, not on the identity of `piece`.
 */
function areEqual(previous: CharacterPieceProps, next: CharacterPieceProps): boolean {
  const a = previous.piece
  const b = next.piece

  return (
    previous.target === next.target &&
    previous.highlightColor === next.highlightColor &&
    previous.onSelectTarget === next.onSelectTarget &&
    previous.onLongPress === next.onLongPress &&
    a.id === b.id &&
    a.character === b.character &&
    a.team === b.team &&
    a.highlightStatus === b.highlightStatus &&
    a.position.equals(b.position) &&
    sameCharacter(a.transformedCharacter, b.transformedCharacter)
  )
}

export const CharacterPiece = memo(CharacterPieceView, areEqual)