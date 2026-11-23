import './Controls.css'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Id of the element that names the switch. */
  labelledBy: string
  describedBy?: string
}

export function Switch({ checked, onChange, labelledBy, describedBy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      className="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__track">
        <span className="switch__thumb" />
      </span>
    </button>
  )
}