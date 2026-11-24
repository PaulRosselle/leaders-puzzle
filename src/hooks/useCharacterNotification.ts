import { useCallback, useEffect, useState } from 'react'
import { isSameNotificationData, type CharacterNotificationData } from '../data/CharacterNotificationData'

/** The notification hides itself after this delay (ms). */
const HIDE_DELAY = 5000

/**
 * State of the character notification (null = hidden).
 * - `toggle`: shows the data, or hides the notification if it already shows them;
 * - each new display restarts the delay before the automatic hiding;
 * - Escape hides it.
 */
export function useCharacterNotification() {
  const [data, setData] = useState<CharacterNotificationData | null>(null)

  const toggle = useCallback((next: CharacterNotificationData) => {
    setData((current) => (current !== null && isSameNotificationData(current, next) ? null : next))
  }, [])

  const hide = useCallback(() => setData(null), [])

  useEffect(() => {
    if (data === null) return

    const timer = window.setTimeout(hide, HIDE_DELAY)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [data, hide])

  return { data, toggle, hide }
}
