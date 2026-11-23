import type { ReactNode } from 'react'

type SettingRowProps = {
  /** Unique id: the ids of the title and of the description are derived from it. */
  id: string
  title: string
  description?: string
  /** `inline`: control on the right of the text. `stacked`: control below, full width. */
  layout?: 'inline' | 'stacked'
  className?: string
  /** Receives the ids to link the control to its title and description (accessibility). */
  children: (a11y: { labelledBy: string; describedBy?: string }) => ReactNode
}

export function SettingRow({ id, title, description, layout = 'inline', className = '', children }: SettingRowProps) {
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`

  return (
    <div className={`setting-row setting-row--${layout} ${className}`}>
      <div className="setting-row__text">
        <div id={titleId} className="setting-row__title">
          {title}
        </div>
        {description && (
          <div id={descriptionId} className="setting-row__description">
            {description}
          </div>
        )}
      </div>

      <div className="setting-row__control">
        {children({ labelledBy: titleId, describedBy: description ? descriptionId : undefined })}
      </div>
    </div>
  )
}