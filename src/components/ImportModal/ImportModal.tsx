import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PuzzleCodeFinder } from '../../data/parser/import/PuzzleCodeFinder'
import { Modal } from '../Modal/Modal'
import './ImportModal.css'

type ImportModalProps = {
  /** Called with the first valid code found in the text (without any "#"). */
  onSubmit: (code: string) => void
  onClose: () => void
}

export function ImportModal({ onSubmit, onClose }: ImportModalProps) {
  const { t } = useTranslation('importModal')
  const [text, setText] = useState('')
  const [invalid, setInvalid] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const code = PuzzleCodeFinder.findFirstValid(text)

    if (code === null) {
      setInvalid(true)
      return
    }

    onSubmit(code)
  }

  return (
    <Modal
      labelledBy="import-modal-title"
      onClose={onClose}
      initialFocusRef={textareaRef}
      panelClassName="import-modal"
    >
      <h2 id="import-modal-title" className="import-modal__title">
        {t('title')}
      </h2>

      <textarea
        ref={textareaRef}
        className="import-modal__field"
        rows={3}
        value={text}
        placeholder={t('placeholder')}
        aria-label={t('fieldLabel')}
        aria-invalid={invalid}
        aria-describedby={invalid ? 'import-modal-error' : undefined}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        onChange={(event) => {
          setText(event.target.value)
          setInvalid(false)
        }}
        onKeyDown={(event) => {
          // Enter validates, Shift+Enter inserts a line break.
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            submit()
          }
        }}
      />

      <div className="import-modal__footer">
        <p id="import-modal-error" className="import-modal__error" role="alert">
          {invalid ? t('invalid') : ''}
        </p>

        <button type="button" className="import-modal__submit" onClick={submit}>
          {t('submit')}
        </button>
      </div>
    </Modal>
  )
}