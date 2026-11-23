import type { Ref } from 'react'
import { useTranslation } from 'react-i18next'
import type { ToolbarItem } from '../../data/ToolbarItems'
import { ToolbarIcon } from './ToolbarIcon'

type ToolbarButtonProps = {
  item: ToolbarItem
  disabled?: boolean
  /** Nothing happens when undefined (the button is not wired yet). */
  onClick?: () => void
  buttonRef?: Ref<HTMLButtonElement>
  /** For a button that opens a menu. */
  popup?: { expanded: boolean; controls: string }
}

export function ToolbarButton({ item, disabled = false, onClick, buttonRef, popup }: ToolbarButtonProps) {
  const { t } = useTranslation('toolbar')
  const label = t(`items.${item.id}`)

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`toolbar__button toolbar__button--${item.visibleOn}`}
      aria-label={label}
      title={label}
      aria-haspopup={popup ? 'menu' : undefined}
      aria-expanded={popup ? popup.expanded : undefined}
      aria-controls={popup?.expanded ? popup.controls : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      <ToolbarIcon icon={item.icon} />
    </button>
  )
}