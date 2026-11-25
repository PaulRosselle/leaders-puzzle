import type { CharacterPortrait } from '../portrait/CharacterPortrait'

/**
 * Automatic import of each portrait (`assets/portraits/portrait_<name>.<ext>`).
 * With `eager`, Vite only gives the URLs: an image is downloaded when it is displayed.
 */
const files = import.meta.glob<string>('../../assets/portraits/portrait_*.{webp,png,jpg,jpeg}', {
  eager: true,
  import: 'default',
})

const PORTRAIT_SOURCES = new Map<string, string>()

for (const [path, source] of Object.entries(files)) {
  const name = /portrait_(.+)\.\w+$/.exec(path)?.[1]
  if (name !== undefined) {
    PORTRAIT_SOURCES.set(name, source)
  }
}

/** URL of the portrait image (undefined if the file does not exist). */
export function getPortraitSource(portrait: CharacterPortrait): string | undefined {
  return PORTRAIT_SOURCES.get(portrait)
}
