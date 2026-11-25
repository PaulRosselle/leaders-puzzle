import { useTranslation } from 'react-i18next'
import { OFFICIAL_PUZZLES, sortPuzzles, type OfficialPuzzle } from '../../data/puzzle/OfficialPuzzle'
import { Modal } from '../Modal/Modal'
import { PuzzleCard } from './PuzzleCard'
import './OfficialPuzzlesModal.css'
import { useSettings } from '../../settings/useSettings'
import { useMemo, useState } from 'react'
import { PUZZLE_SORTS } from '../../settings/Settings'
import { loadCompletedPuzzleIds } from '../../data/puzzle/CompletedPuzzles'

type OfficialPuzzlesModalProps = {
  currentPuzzleId: number | null
  /** Receives the code to put in the URL (without the leading `#`). */
  onSelect: (code: string) => void
  onClose: () => void
}

export function OfficialPuzzlesModal({ currentPuzzleId, onSelect, onClose }: OfficialPuzzlesModalProps) {
  const { t } = useTranslation('puzzles')
  const { settings, updateSettings } = useSettings()

  const sortedPuzzles = useMemo(
    () => sortPuzzles(OFFICIAL_PUZZLES, settings.puzzleSort),
    [settings.puzzleSort],
  )

  const [completedIds] = useState(loadCompletedPuzzleIds)
  
  const handleSelect = (puzzle: OfficialPuzzle) => onSelect(puzzle.data.replace(/^#/, ''))

  return (
    <Modal labelledBy="puzzles-modal-title" onClose={onClose} panelClassName="puzzles-modal">
      <header className="puzzles-modal__header">
        <h2 id="puzzles-modal-title" className="puzzles-modal__title">
          {t('title')}
        </h2>

        <button type="button" className="puzzles-modal__close" aria-label={t('close')} onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="puzzles-modal__sort">
        <span id="puzzles-sort-label" className="puzzles-modal__sort-label">
          {t('sort.label')}
        </span>

        <div className="puzzles-modal__sort-options" role="radiogroup" aria-labelledby="puzzles-sort-label">
          {PUZZLE_SORTS.map((sort) => (
            <button
              key={sort}
              type="button"
              role="radio"
              aria-checked={settings.puzzleSort === sort}
              className={`puzzles-modal__sort-option${settings.puzzleSort === sort ? ' puzzles-modal__sort-option--active' : ''}`}
              onClick={() => updateSettings({ puzzleSort: sort })}
            >
              {t(`sort.${sort}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="puzzles-modal__body">
        <div className="puzzles-modal__grid">
          {sortedPuzzles.map((puzzle) => (
            <PuzzleCard
              key={puzzle.id}
              puzzle={puzzle}
              isCurrent={puzzle.id === currentPuzzleId}
              isCompleted={completedIds.has(puzzle.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}