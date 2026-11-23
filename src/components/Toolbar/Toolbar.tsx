import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import {
  MORE_MENU_ITEMS,
  TOOLBAR_ITEMS,
  type ToolbarGroup,
  type ToolbarItem,
  type ToolbarItemId,
} from '../../data/ToolbarItems'
import type { ToolbarPosition } from '../../settings/Settings'
import { ToolbarButton } from './ToolbarButton'
import { ToolbarMenu } from './ToolbarMenu'
import './Toolbar.css'

type ToolbarProps = {
  /** Side of the screen of the vertical bar (landscape only). */
  position?: ToolbarPosition
  /**
   * Action of each button (also used by the "more" menu, which has the same
   * entries). A button without action does nothing. `more` is handled here.
   */
  actions?: Partial<Record<ToolbarItemId, () => void>>
  /** Buttons to display as disabled (e.g. `{ undo: !canUndo }`). */
  disabled?: Partial<Record<ToolbarItemId, boolean>>
}

const GROUPS: readonly ToolbarGroup[] = ['start', 'end']
const MORE_MENU_ID = 'toolbar-more-menu'

/**
 * Landscape: vertical bar on the left. Portrait: horizontal bar at the bottom.
 * The switch is done in CSS only (see Toolbar.css).
 */
export function Toolbar({ position = 'left', actions = {}, disabled = {} }: ToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false)
    if (restoreFocus) moreButtonRef.current?.focus()
  }, [])

  // The "more" button disappears in landscape: the menu must not stay open.
  useEffect(() => {
    const landscape = window.matchMedia('(orientation: landscape)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false)
    }

    landscape.addEventListener('change', handleChange)
    return () => landscape.removeEventListener('change', handleChange)
  }, [])

  // Same behavior as the button of the toolbar with the same id.
  const selectMenuItem = (item: ToolbarItem) => {
    // Focus first: a modal opened by the action gives it back to the "more" button when closed.
    closeMenu(true)
    actions[item.id]?.()
  }

  return (
    <div className={`toolbar toolbar--${position}`} role="toolbar" aria-label="Outils">
      {GROUPS.map((group) => (
        <div key={group} className={`toolbar__group toolbar__group--${group}`}>
          {TOOLBAR_ITEMS.filter((item) => item.group === group).map((item) => {
            const isMore = item.id === 'more'

            return (
              <Fragment key={item.id}>
                {item.separatorBefore && (
                  <div className="toolbar__separator" role="separator" aria-orientation="horizontal" />
                )}
                <ToolbarButton
                  item={item}
                  disabled={disabled[item.id] ?? false}
                  onClick={isMore ? () => setMenuOpen((open) => !open) : actions[item.id]}
                  buttonRef={isMore ? moreButtonRef : undefined}
                  popup={isMore ? { expanded: menuOpen, controls: MORE_MENU_ID } : undefined}
                />
              </Fragment>
            )
          })}
        </div>
      ))}

      {menuOpen && (
        <ToolbarMenu
          id={MORE_MENU_ID}
          items={MORE_MENU_ITEMS}
          disabled={disabled}
          anchorRef={moreButtonRef}
          onSelect={selectMenuItem}
          onClose={closeMenu}
        />
      )}
    </div>
  )
}