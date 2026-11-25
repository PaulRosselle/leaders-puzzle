import type { TFunction } from 'i18next'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { PuzzleError } from '../../data/puzzle/PuzzleError'
import { CharacterType } from '../../gamelogic/enums/CharacterType'
import { Team } from '../../gamelogic/enums/Team'
import { Modal } from '../Modal/Modal'
import './PuzzleErrorModal.css'

type PuzzleErrorModalProps = {
  errors: readonly PuzzleError[]
  onClose: () => void
}

type Translate = TFunction<'puzzleErrors'>

function describeError(error: PuzzleError, t: Translate): string {
  switch (error.code) {
    case 'emptyPlayerTeam':
      return t('errors.emptyPlayerTeam')
    case 'unknownCharacter':
      return t('errors.unknownCharacter', { characterId: error.characterId })
    case 'unexpected':
      return t('errors.unexpected')
    case 'frogLimit':
      return t('errors.frogLimit')
    case 'leaderTransformedIntoFrog':
      return t('errors.leaderTransformedIntoFrog')
    case 'leaderMissing':
      return t('errors.leaderMissing', { team: describeTeam(error.team, t) })
    case 'leaderCaptured':
      return t('errors.leaderCaptured', { team: describeTeam(error.team, t) })
    case 'leaderSurrounded':
      return t('errors.leaderSurrounded', { team: describeTeam(error.team, t) })
    case 'oneLeaderPerTeam':
      return t('errors.oneLeaderPerTeam')
    case 'onePerTeamCharacter':
      return t('errors.onePerTeamCharacter', { character: CharacterType[error.characterType] })
    case 'hermitAndCubLimit':
      return t('errors.hermitAndCubLimit')
  }
}

function describeTeam(team: Team, t: Translate): string {
  return team === Team.Black ? t('teams.black') : t('teams.white')
}

/** Tells the player why the puzzle of the URL cannot be played. */
export function PuzzleErrorModal({ errors, onClose }: PuzzleErrorModalProps) {
  const { t } = useTranslation('puzzleErrors')
  const closeRef = useRef<HTMLButtonElement>(null)

  return (
    <Modal
      labelledBy="puzzle-error-modal-title"
      onClose={onClose}
      initialFocusRef={closeRef}
      panelClassName="puzzle-error-modal"
    >
      <h2 id="puzzle-error-modal-title" className="puzzle-error-modal__title">
        {t('title')}
      </h2>

      <p className="puzzle-error-modal__intro">{t('intro')}</p>

      <ul className="puzzle-error-modal__list">
        {errors.map((error, index) => (
          <li key={index}>{describeError(error, t)}</li>
        ))}
      </ul>

      <div className="puzzle-error-modal__footer">
        <button ref={closeRef} type="button" className="puzzle-error-modal__close" onClick={onClose}>
          {t('close')}
        </button>
      </div>
    </Modal>
  )
}
