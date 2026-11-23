import { Fragment } from 'react'
import { TOOLBAR_ITEMS, type ToolbarGroup, type ToolbarItemId } from '../../data/ToolbarItems'
import { ToolbarButton } from './ToolbarButton'
import './Toolbar.css'

type ToolbarProps = {
  /** Action of each button. A button without action does nothing. */
  actions?: Partial<Record<ToolbarItemId, () => void>>
  /** Buttons to display as disabled (e.g. `{ undo: !canUndo }`). */
  disabled?: Partial<Record<ToolbarItemId, boolean>>
}

const GROUPS: readonly ToolbarGroup[] = ['start', 'end']

/**
 * Landscape: vertical bar on the left. Portrait: horizontal bar at the bottom.
 * The switch is done in CSS only (see Toolbar.css).
 */
export function Toolbar({ actions = {}, disabled = {} }: ToolbarProps) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Outils">
      {GROUPS.map((group) => (
        <div key={group} className={`toolbar__group toolbar__group--${group}`}>
          {TOOLBAR_ITEMS.filter((item) => item.group === group).map((item) => (
            <Fragment key={item.id}>
              {item.separatorBefore && (
                <div className="toolbar__separator" role="separator" aria-orientation="horizontal" />
              )}
              <ToolbarButton
                item={item}
                disabled={disabled[item.id] ?? false}
                onClick={actions[item.id]}
              />
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  )
}