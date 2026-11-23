import editIcon from '../assets/icons/edit.svg'
import gridIcon from '../assets/icons/grid.svg'
import importIcon from '../assets/icons/import.svg'
import moreIcon from '../assets/icons/more.svg'
import restartIcon from '../assets/icons/restart.svg'
import settingsIcon from '../assets/icons/settings.svg'
import undoIcon from '../assets/icons/undo.svg'

export type ToolbarItemId =
  | 'restart'
  | 'undo'
  | 'grid'
  | 'import'
  | 'edit'
  | 'settings'
  | 'more'

/**
 * Where the item sits in the toolbar (landscape layout):
 * `start` = top of the vertical bar, `end` = bottom of the vertical bar.
 */
export type ToolbarGroup = 'start' | 'end'

/**
 * In which layout the item is displayed:
 * - `landscape`: wide screens (vertical bar on the left);
 * - `portrait`: tall screens (horizontal bar at the bottom);
 * - `both`: always.
 */
export type ToolbarVisibility = 'both' | 'landscape' | 'portrait'

export type ToolbarItem = {
  id: ToolbarItemId
  icon: string
  group: ToolbarGroup
  visibleOn: ToolbarVisibility
  /** Draws a separator above the item (landscape layout only). */
  separatorBefore?: boolean
}

// Order = display order (top to bottom, or left to right).
// The accessible name / tooltip of each item is in the translations: `toolbar.items.<id>`.
export const TOOLBAR_ITEMS: readonly ToolbarItem[] = [
  { id: 'restart', icon: restartIcon, group: 'start', visibleOn: 'both' },
  { id: 'undo', icon: undoIcon, group: 'start', visibleOn: 'both', separatorBefore: true },
  { id: 'grid', icon: gridIcon, group: 'end', visibleOn: 'landscape', separatorBefore: true },
  { id: 'import', icon: importIcon, group: 'end', visibleOn: 'landscape' },
  { id: 'edit', icon: editIcon, group: 'end', visibleOn: 'landscape' },
  { id: 'settings', icon: settingsIcon, group: 'end', visibleOn: 'landscape', separatorBefore: true },
  { id: 'more', icon: moreIcon, group: 'end', visibleOn: 'portrait' },
]

/**
 * Items folded in the "more" menu: the ones that are hidden from the toolbar
 * in the portrait layout (they are directly in the toolbar in landscape).
 */
export const MORE_MENU_ITEMS: readonly ToolbarItem[] = TOOLBAR_ITEMS.filter(
  (item) => item.visibleOn === 'landscape',
)