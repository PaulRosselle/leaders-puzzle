import { useState } from 'react'
import type { CharacterNotificationData } from '../../data/CharacterNotificationData'
import { PortraitDescription } from './PortraitDescription'
import './CharacterNotification.css'

type CharacterNotificationProps = {
  /** What to display (null = hidden). */
  data: CharacterNotificationData | null
  /** Called when the player taps the notification. */
  onClose: () => void
}

/**
 * Description of a character, displayed at the top of the screen.
 * Always mounted: the last data stay displayed while the notification slides out.
 */
export function CharacterNotification({ data, onClose }: CharacterNotificationProps) {
  const [lastData, setLastData] = useState<CharacterNotificationData | null>(data)

  // Adjusting the state while rendering is the React way to keep the last non-null value.
  if (data !== null && data !== lastData) {
    setLastData(data)
  }

  const displayed = data ?? lastData
  const hasAdditional = displayed?.additional != null

  return (
    <div className="character-notification" data-open={data !== null} onClick={onClose}>
      {displayed !== null && (
        <div
          className={`character-notification__body ${hasAdditional ? 'character-notification__body--double' : ''}`}
        >
          <PortraitDescription portrait={displayed.main} />
          {displayed.additional !== null && (
            <>
              <div className="character-notification__separator" />
              <PortraitDescription portrait={displayed.additional} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
