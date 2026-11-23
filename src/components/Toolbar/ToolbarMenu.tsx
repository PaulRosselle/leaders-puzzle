import { useEffect, useRef } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import type { ToolbarItem, ToolbarItemId } from '../../data/ToolbarItems'
import { ToolbarIcon } from './ToolbarIcon'
import './ToolbarMenu.css'

type ToolbarMenuProps = {
  id: string
  items: readonly ToolbarItem[]
  disabled: Partial<Record<ToolbarItemId, boolean>>
  /** The button that opened the menu: clicking it is not an "outside" click. */
  anchorRef: RefObject<HTMLElement | null>
  onSelect: (item: ToolbarItem) => void
  /** `restoreFocus`: gives the focus back to the button that opened the menu. */
  onClose: (restoreFocus: boolean) => void
}

const ENABLED_ITEMS = '[role="menuitem"]:not(:disabled)'

export function ToolbarMenu({ id, items, disabled, anchorRef, onSelect, onClose }: ToolbarMenuProps) {
  const { t } = useTranslation('toolbar')
  const menuRef = useRef<HTMLDivElement>(null)

  // Keyboard users start on the first item.
  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>(ENABLED_ITEMS)?.focus()
  }, [])

  // Click / touch outside of the menu closes it.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || anchorRef.current?.contains(target)) return
      onClose(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [anchorRef, onClose])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabledItems = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ENABLED_ITEMS) ?? [])
    const index = enabledItems.indexOf(document.activeElement as HTMLElement)

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        enabledItems[(index + 1) % enabledItems.length]?.focus()
        break
      case 'ArrowUp':
        event.preventDefault()
        enabledItems[(index - 1 + enabledItems.length) % enabledItems.length]?.focus()
        break
      case 'Home':
        event.preventDefault()
        enabledItems[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        enabledItems[enabledItems.length - 1]?.focus()
        break
      case 'Escape':
        event.preventDefault()
        onClose(true)
        break
      case 'Tab':
        // The focus goes back to the button, then the Tab moves on from there.
        onClose(true)
        break
    }
  }

  return (
    <div
      ref={menuRef}
      id={id}
      className="toolbar-menu"
      role="menu"
      aria-label={t('items.more')}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          tabIndex={-1}
          className="toolbar-menu__item"
          disabled={disabled[item.id] ?? false}
          onClick={() => onSelect(item)}
        >
          <ToolbarIcon icon={item.icon} />
          <span className="toolbar-menu__label">{t(`items.${item.id}`)}</span>
        </button>
      ))}
    </div>
  )
}