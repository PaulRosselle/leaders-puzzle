/** Automatic import of the puzzle card images (`assets/puzzles/*.webp`). */
const files = import.meta.glob<string>('../assets/puzzles/*.webp', {
  eager: true,
  import: 'default',
})

const PUZZLE_SOURCES = new Map<string, string>()

for (const [path, source] of Object.entries(files)) {
  const name = /([^/]+)\.webp$/.exec(path)?.[1]
  if (name !== undefined) {
    PUZZLE_SOURCES.set(name, source)
  }
}

export type PuzzleAssetName = 'crown' | 'difficulty_marker' | 'difficulty_marker_empty'

/** URL of the image (undefined if the file does not exist). */
export function getPuzzleAssetSource(name: PuzzleAssetName): string | undefined {
  return PUZZLE_SOURCES.get(name)
}