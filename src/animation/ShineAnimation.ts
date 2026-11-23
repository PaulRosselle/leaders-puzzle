import { decelerate, toCssEasing } from './Easings'

const SHINE_DURATION = 600
const SHINE_INTERVAL = 1200
const SHINE_CYCLE_PAUSE = 1600
const SHINE_ANIMATION_ID = 'shine'

// The band is rotated by -25deg around the center of the piece, then slides along
// its own axis. 135% of its width (0.52 cell) = 0.7 cell: enough to leave the
// circle (radius 0.42 cell) completely on both sides.
const SHINE_KEYFRAMES: Keyframe[] = [
  { opacity: 1, transform: 'rotate(-25deg) translateX(-135%)' },
  { opacity: 1, transform: 'rotate(-25deg) translateX(135%)' },
]

function findShineBand(characterId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-piece-id="${characterId}"] .character-piece__shine-band`,
  )
}

/** Plays one shine on a piece (restarts it if already running). No-op if the piece is not highlighted. */
export function playShine(characterId: string): void {
  const band = findShineBand(characterId)
  if (band === null) {
    return
  }

  stopShine(characterId)
  band.animate(SHINE_KEYFRAMES, {
    id: SHINE_ANIMATION_ID,
    duration: SHINE_DURATION,
    easing: toCssEasing(decelerate(1.2)),
    // fill: 'none' (default): the band goes back to opacity 0 at the end.
  })
}

export function stopShine(characterId: string): void {
  findShineBand(characterId)
    ?.getAnimations()
    .filter((animation) => animation.id === SHINE_ANIMATION_ID)
    .forEach((animation) => animation.cancel())
}

function sleep(duration: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve()
      return
    }
    const timeout = setTimeout(resolve, duration)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout)
        resolve()
      },
      { once: true },
    )
  })
}

/**
 * Plays the shine of each piece one after the other, in a loop, until aborted.
 * Cycle: pause/2, one shine every SHINE_INTERVAL, pause/2
 * (total = SHINE_INTERVAL * n + SHINE_CYCLE_PAUSE, like the Java ValueAnimator).
 */
export async function runShineCycles(characterIds: readonly string[], signal: AbortSignal): Promise<void> {
  const halfPause = SHINE_CYCLE_PAUSE / 2

  while (!signal.aborted) {
    await sleep(halfPause, signal)

    for (const characterId of characterIds) {
      if (signal.aborted) {
        return
      }
      playShine(characterId)
      await sleep(SHINE_INTERVAL, signal)
    }

    await sleep(halfPause, signal)
  }
}