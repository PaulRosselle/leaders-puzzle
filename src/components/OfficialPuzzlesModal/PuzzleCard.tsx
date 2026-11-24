import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { DIFFICULTY_STYLES, MAX_DIFFICULTY_LEVEL, type OfficialPuzzle } from '../../data/OfficialPuzzle'
import { getPuzzleAssetSource } from '../../data/PuzzleAsset'

type PuzzleCardProps = {
  puzzle: OfficialPuzzle
  onSelect: (puzzle: OfficialPuzzle) => void
}

const cssUrl = (source: string | undefined) => (source ? `url("${source}")` : 'none')

const CROWN_URL = cssUrl(getPuzzleAssetSource('crown'))
const MARKER_URL = cssUrl(getPuzzleAssetSource('difficulty_marker'))
const MARKER_EMPTY_URL = cssUrl(getPuzzleAssetSource('difficulty_marker_empty'))

export function PuzzleCard({ puzzle, onSelect }: PuzzleCardProps) {
  const { t } = useTranslation('puzzles')
  const { level, crownColor, markerTint } = DIFFICULTY_STYLES[puzzle.difficulty]

  const style = {
    '--crown-url': CROWN_URL,
    '--crown-color': crownColor,
    '--marker-url': MARKER_URL,
    '--marker-empty-url': MARKER_EMPTY_URL,
    '--marker-tint': markerTint ?? 'transparent',
  } as CSSProperties

  return (
    <button
      type="button"
      className="puzzle-card"
      style={style}
      aria-label={t('puzzleLabel', {
        id: puzzle.id,
        difficulty: t(`difficulty.${puzzle.difficulty}`),
      })}
      onClick={() => onSelect(puzzle)}
    >
      <span className="puzzle-card__emblem" aria-hidden="true">
        <span className="puzzle-card__crown" />
        <span className="puzzle-card__number">{puzzle.id}</span>
      </span>

      <span className="puzzle-card__markers" aria-hidden="true">
        {Array.from({ length: MAX_DIFFICULTY_LEVEL }, (_, index) => (
          <span
            key={index}
            className={`puzzle-card__marker ${index < level ? 'puzzle-card__marker--filled' : 'puzzle-card__marker--empty'}`}
          />
        ))}
      </span>
    </button>
  )
}