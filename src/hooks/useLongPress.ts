import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { MouseEvent, PointerEvent } from 'react'

type LongPressOptions = {
  /** Press duration before the long press is triggered (ms, 500 like Android). */
  delay?: number
  /** Distance (px) the pointer can move before the press is no longer a long press. */
  moveTolerance?: number
}

/**
 * Long press (finger or mouse) on an element.
 *
 * - Spread `handlers` on the element.
 * - Call `consumeLongPress()` in its `onClick`: the click that ends a long
 *   press is not a real click and must be ignored (returns true once).
 * - A right click (`contextmenu`) triggers it too, and the browser menu that
 *   some mobile browsers open on a long press is blocked.
 *
 * Without `onLongPress`, nothing is intercepted.
 */
export function useLongPress(
  onLongPress: (() => void) | undefined,
  { delay = 500, moveTolerance = 10 }: LongPressOptions = {},
) {
  const callbackRef = useRef(onLongPress)
  const timerRef = useRef<number | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const firedRef = useRef(false)

  useEffect(() => {
    callbackRef.current = onLongPress
  })

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    startRef.current = null
  }, [])

  const fire = useCallback(() => {
    cancel()
    firedRef.current = true
    callbackRef.current?.()
  }, [cancel])

  // The timer must not outlive the element.
  useEffect(() => cancel, [cancel])

  const handlers = useMemo(
    () => ({
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        cancel()
        firedRef.current = false

        if (!callbackRef.current || !event.isPrimary) return
        if (event.pointerType === 'mouse' && event.button !== 0) return

        startRef.current = { x: event.clientX, y: event.clientY }
        timerRef.current = window.setTimeout(fire, delay)
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const start = startRef.current
        if (start === null) return

        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > moveTolerance) {
          cancel()
        }
      },
      onPointerUp: cancel,
      onPointerCancel: cancel,
      onContextMenu: (event: MouseEvent<HTMLElement>) => {
        if (!callbackRef.current) return

        event.preventDefault()
        // Some mobile browsers fire this event just before our own timer.
        if (!firedRef.current) fire()
      },
    }),
    [cancel, fire, delay, moveTolerance],
  )

  const consumeLongPress = useCallback(() => {
    const wasLongPress = firedRef.current
    firedRef.current = false
    return wasLongPress
  }, [])

  return { handlers, consumeLongPress }
}
