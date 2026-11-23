import { useEffect, useRef } from 'react'
import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import './Modal.css'

type ModalProps = {
  /** Id of the element that gives its title to the dialog. */
  labelledBy: string
  onClose: () => void
  /** Element focused on opening (default: first focusable element of the modal). */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** Added to the panel, to style it (the width comes from `--modal-width`). */
  panelClassName?: string
  children: ReactNode
}

const FOCUSABLE = 'button, textarea, input, select, a[href], [tabindex]'

/**
 * Shell shared by the modals: dark background, dialog panel, Escape / click
 * outside to close, focus kept inside, focus given back to the opener.
 */
export function Modal({ labelledBy, onClose, initialFocusRef, panelClassName = '', children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Read at the first render, before anything inside the modal takes the focus.
  const openerRef = useRef<Element | null>(document.activeElement)

  /** Elements reachable with the Tab key (a `tabindex="-1"` one is not). */
  const getTabbableElements = (): HTMLElement[] =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (element) => element.tabIndex >= 0 && !element.hasAttribute('disabled'),
    )

  useEffect(() => {
    const opener = openerRef.current
    const initialFocus = initialFocusRef?.current ?? getTabbableElements()[0]
    initialFocus?.focus()

    // Gives the focus back to the element that opened the modal.
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- on mount only
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // The shortcuts of the game (Ctrl+Z...) must not act while a modal is open.
    event.stopPropagation()

    if (event.key === 'Escape') {
      onClose()
      return
    }

    if (event.key === 'Tab') {
      const tabbable = getTabbableElements()
      if (tabbable.length === 0) return

      const first = tabbable[0]
      const last = tabbable[tabbable.length - 1]

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
      className="modal"
      onMouseDown={(event) => {
        // Click on the dark background only (not on the panel).
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={panelRef}
        className={`modal__panel ${panelClassName}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>
  )
}