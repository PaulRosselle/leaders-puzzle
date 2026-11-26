// Keeps a reference so the browser is less likely to drop the decoded images.
const kept: HTMLImageElement[] = []

type NetworkInformation = { saveData?: boolean }

function whenIdle(callback: () => void): void {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback)
  } else {
    window.setTimeout(callback, 500)
  }
}

function loadOne(url: string): Promise<void> {
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  kept.push(img)
  // decode() rejects on error: the preload must never break anything.
  return img.decode().catch(() => {})
}

/**
 * Downloads and decodes images while the browser is idle, batch after batch:
 * a batch only starts once the previous one is done, so the most useful
 * images (first batches) are never slowed down by the heavy ones (last batches).
 * Does nothing when the user asked to save data.
 */
export function preloadImages(batches: readonly (readonly string[])[]): void {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (connection?.saveData) return

  const seen = new Set<string>()
  const queue = batches
    .map((batch) => batch.filter((url) => url !== undefined && !seen.has(url) && seen.add(url)))
    .filter((batch) => batch.length > 0)

  const next = (): void => {
    const batch = queue.shift()
    if (batch === undefined) return
    whenIdle(() => {
      void Promise.allSettled(batch.map(loadOne)).then(next)
    })
  }
  next()
}