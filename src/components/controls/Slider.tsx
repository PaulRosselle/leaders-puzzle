import type { CSSProperties } from 'react'
import './Controls.css'

type SliderProps = {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  /** Id of the element that names the slider. */
  labelledBy: string
  describedBy?: string
  /** Text read by screen readers instead of the raw number. */
  valueText?: string
  /** Captions under the two ends of the slider. */
  minLabel?: string
  maxLabel?: string
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  labelledBy,
  describedBy,
  valueText,
  minLabel,
  maxLabel,
}: SliderProps) {
  const fraction = max > min ? (value - min) / (max - min) : 0

  return (
    <div className="slider">
      <input
        type="range"
        className="slider__input"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-valuetext={valueText}
        style={{ '--slider-fraction': fraction } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />

      {(minLabel || maxLabel) && (
        <div className="slider__labels">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}