import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { PuzzleCodeFinder } from '../../data/parser/import/PuzzleCodeFinder'
import './ImportModal.css'

const TEXTS = {
  title: 'Importer un puzzle', // TODO - handle english
  fieldLabel: 'Code du puzzle', // TODO - handle english
  placeholder: 'code du puzzle (exemple : #white=b5:2&black=c4:1,d4:3)', // TODO - handle english
  submit: 'Importer', // TODO - handle english
  invalid: 'Code invalide', // TODO - handle english
}

type ImportModalProps = {
  /** Called with the first valid code found in the text (without any "#"). */
  onSubmit: (code: string) => void
  onClose: () => void
}

export function ImportModal({ onSubmit, onClose }: ImportModalProps) {
  const [text, setText] = useState('')
  const [invalid, setInvalid] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Read at the first render, before the field takes the focus.
  const openerRef = useRef<Element | null>(document.activeElement)

  useEffect(() => {
    const opener = openerRef.current
    textareaRef.current?.focus()

    // Gives the focus back to the button that opened the modal.
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [])

  const submit = () => {
    const code = PuzzleCodeFinder.findFirstValid(text)

    if (code === null) {
      setInvalid(true)
      return
    }

    onSubmit(code)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The shortcuts of the game (Ctrl+Z...) must not act while the modal is open.
    event.stopPropagation()

    if (event.key === 'Escape') {
      onClose()
      return
    }

    // Keeps the keyboard focus inside the modal.
    if (event.key === 'Tab') {
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>('textarea, button')
      if (!focusables || focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  return (
    <div
      className="import-modal"
      onMouseDown={(event) => {
        // Click on the dark background only (not on the panel).
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={panelRef}
        className="import-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
      >
        <h2 id="import-modal-title" className="import-modal__title">
          {TEXTS.title}
        </h2>

        <textarea
          ref={textareaRef}
          className="import-modal__field"
          rows={3}
          value={text}
          placeholder={TEXTS.placeholder}
          aria-label={TEXTS.fieldLabel}
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
            {invalid ? TEXTS.invalid : ''}
          </p>

          <button type="button" className="import-modal__submit" onClick={submit}>
            {TEXTS.submit}
          </button>
        </div>
      </div>
    </div>
  )
}