import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import './controls.css'

export type SegmentedOption<T extends string> = { value: T; label: string }

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Id of the element that names the control. */
  labelledBy: string
  describedBy?: string
}

/** A group of exclusive choices displayed side by side (radio group pattern). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labelledBy,
  describedBy,
}: SegmentedControlProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null)

  // Arrow keys move the selection (and the focus), like native radio buttons.
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
    groupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus()
  }

  return (
    <div
      ref={groupRef}
      className="segmented"
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
            className="segmented__option"
            aria-checked={selected}
            // Only the selected option is reached with Tab (arrows do the rest).
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}