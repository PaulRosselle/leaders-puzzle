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
  /** Accessible name and tooltip. */
  label: string
  group: ToolbarGroup
  visibleOn: ToolbarVisibility
  /** Draws a separator above the item (landscape layout only). */
  separatorBefore?: boolean
}

// TODO - handle english (labels below are hard-coded in French)
// Order = display order (top to bottom, or left to right).
export const TOOLBAR_ITEMS: readonly ToolbarItem[] = [
  { id: 'restart', icon: restartIcon, label: 'Recommencer', group: 'start', visibleOn: 'both' },
  { id: 'undo', icon: undoIcon, label: 'Annuler (Ctrl+Z)', group: 'start', visibleOn: 'both', separatorBefore: true },
  { id: 'grid', icon: gridIcon, label: 'Puzzles officiels', group: 'end', visibleOn: 'landscape', separatorBefore: true },
  { id: 'import', icon: importIcon, label: 'Importer', group: 'end', visibleOn: 'landscape' },
  { id: 'edit', icon: editIcon, label: 'Ouvrir dans l\'éditeur', group: 'end', visibleOn: 'landscape' },
  { id: 'settings', icon: settingsIcon, label: 'Paramètres', group: 'end', visibleOn: 'landscape', separatorBefore: true  },
  { id: 'more', icon: moreIcon, label: 'Plus d\u2019options', group: 'end', visibleOn: 'portrait' },
]