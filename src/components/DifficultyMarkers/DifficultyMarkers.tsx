import type { CSSProperties } from 'react'
import { DIFFICULTY_STYLES, MAX_DIFFICULTY_LEVEL, type Difficulty } from '../../data/puzzle/OfficialPuzzle'
import { getPuzzleAssetSource } from '../../data/asset/PuzzleAsset'
import { cssUrl } from '../../utils/cssUrl'
import './DifficultyMarkers.css'

type DifficultyMarkersProps = {
  difficulty: Difficulty
  className?: string
}

const MARKER_URL = cssUrl(getPuzzleAssetSource('difficulty_marker'))
const MARKER_EMPTY_URL = cssUrl(getPuzzleAssetSource('difficulty_marker_empty'))

/** Row of markers (filled up to the difficulty level). Sized in `em`, so it follows the parent's font-size. */
export function DifficultyMarkers({ difficulty, className }: DifficultyMarkersProps) {
  const { level, markerTint } = DIFFICULTY_STYLES[difficulty]

  const style = {
    '--marker-url': MARKER_URL,
    '--marker-empty-url': MARKER_EMPTY_URL,
    '--marker-tint': markerTint ?? 'transparent',
  } as CSSProperties

  return (
    <span className={`difficulty-markers${className ? ` ${className}` : ''}`} style={style} aria-hidden="true">
      {Array.from({ length: MAX_DIFFICULTY_LEVEL }, (_, index) => (
        <span
          key={index}
          className={`difficulty-markers__marker ${
            index < level ? 'difficulty-markers__marker--filled' : 'difficulty-markers__marker--empty'
          }`}
        />
      ))}
    </span>
  )
}