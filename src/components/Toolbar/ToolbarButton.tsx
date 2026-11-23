import type { CSSProperties } from 'react'
import type { ToolbarItem } from '../../data/ToolbarItems'

type ToolbarButtonProps = {
  item: ToolbarItem
  disabled?: boolean
  /** Nothing happens when undefined (the buttons are not wired yet). */
  onClick?: () => void
}

export function ToolbarButton({ item, disabled = false, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`toolbar__button toolbar__button--${item.visibleOn}`}
      aria-label={item.label}
      title={item.label}
      disabled={disabled}
      onClick={onClick}
    >
      {/* The icon is a mask painted with `currentColor`, so CSS drives its color. */}
      <span
        className="toolbar__icon"
        aria-hidden="true"
        style={{ '--toolbar-icon-url': `url("${item.icon}")` } as CSSProperties}
      />
    </button>
  )
}