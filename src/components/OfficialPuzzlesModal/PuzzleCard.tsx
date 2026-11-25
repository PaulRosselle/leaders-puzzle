import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { DIFFICULTY_STYLES, type OfficialPuzzle } from '../../data/puzzle/OfficialPuzzle'
import { getPuzzleAssetSource } from '../../data/asset/PuzzleAsset'
import { cssUrl } from '../../utils/cssUrl'
import { DifficultyMarkers } from '../DifficultyMarkers/DifficultyMarkers'

type PuzzleCardProps = {
  puzzle: OfficialPuzzle
  isCurrent?: boolean
  isCompleted?: boolean
  onSelect: (puzzle: OfficialPuzzle) => void
}

const CROWN_URL = cssUrl(getPuzzleAssetSource('crown'))

export function PuzzleCard({ puzzle, isCurrent = false, isCompleted = false, onSelect }: PuzzleCardProps) {
  const { t } = useTranslation('puzzles')
  const { crownColor } = DIFFICULTY_STYLES[puzzle.difficulty]

  const style = {
    '--crown-url': CROWN_URL,
    '--crown-color': crownColor,
  } as CSSProperties

  return (
    <button
      type="button"
      className={`puzzle-card${isCurrent ? ' puzzle-card--current' : ''}${isCompleted ? ' puzzle-card--completed' : ''}`}
      style={style}
      aria-current={isCurrent || undefined}
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

      <DifficultyMarkers difficulty={puzzle.difficulty} className="puzzle-card__markers" />
    </button>
  )
}