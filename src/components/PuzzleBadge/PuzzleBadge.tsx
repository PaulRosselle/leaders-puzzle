import { useTranslation } from 'react-i18next'
import type { OfficialPuzzle } from '../../data/OfficialPuzzle'
import { DifficultyMarkers } from '../DifficultyMarkers/DifficultyMarkers'
import './PuzzleBadge.css'

type PuzzleBadgeProps = {
  puzzle: OfficialPuzzle
}

/** Id and difficulty of the official puzzle. Must be rendered inside `.board__stage`. */
export function PuzzleBadge({ puzzle }: PuzzleBadgeProps) {
  const { t } = useTranslation('puzzles')

  return (
    <div
      className="puzzle-badge"
      role="img"
      aria-label={t('puzzleLabel', {
        id: puzzle.id,
        difficulty: t(`difficulty.${puzzle.difficulty}`),
      })}
    >
      <span className="puzzle-badge__id" aria-hidden="true">
        #{puzzle.id}
      </span>
      <DifficultyMarkers difficulty={puzzle.difficulty} className="puzzle-badge__markers" />
    </div>
  )
}