import type { CSSProperties } from 'react'

/** Icon painted with `currentColor` (the SVG is used as a mask, see Toolbar.css). */
export function ToolbarIcon({ icon }: { icon: string }) {
  return (
    <span
      className="toolbar__icon"
      aria-hidden="true"
      style={{ '--toolbar-icon-url': `url("${icon}")` } as CSSProperties}
    />
  )
}