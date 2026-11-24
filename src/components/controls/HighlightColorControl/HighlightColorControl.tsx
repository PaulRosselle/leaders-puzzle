import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { HIGHLIGHT_COLOR_PREVIEWS } from '../../../data/HighlightAsset'
import type { HighlightColor } from '../../../data/HighlightColor'
import './HighlightColorControl.css'

export type HighlightColorOption = {
  value: HighlightColor
  label: string
}

type HighlightColorControlProps = {
  options: readonly HighlightColorOption[]
  value: HighlightColor
  onChange: (value: HighlightColor) => void
  labelledBy: string
  describedBy?: string
}

/** A group of exclusive circular highlight color choices. */
export function HighlightColorControl({
  options,
  value,
  onChange,
  labelledBy,
  describedBy,
}: HighlightColorControlProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  // Arrow keys move the selection (and the focus).
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0

    if (step === 0) return

    event.preventDefault()

    const current = options.findIndex((option) => option.value === value)
    const next = (current + step + options.length) % options.length

    onChange(options[next].value)

    groupRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]
      ?.focus()
  }

  return (
    <div
      ref={groupRef}
      className="highlight-colors"
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const selected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            className="highlight-colors__option"
            aria-label={option.label}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
          >
            <img
              className="highlight-colors__preview"
              src={HIGHLIGHT_COLOR_PREVIEWS[option.value]}
              alt=""
              draggable={false}
            />

            {selected && (
              <svg
                className="highlight-colors__check"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12.5 10 17 20 6.5" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}