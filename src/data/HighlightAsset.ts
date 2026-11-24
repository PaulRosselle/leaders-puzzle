import { HighlightColor } from './HighlightColor'

export const HIGHLIGHT_ASSETS = {
  [HighlightColor.Default]: 'default',
  [HighlightColor.Blue]: 'blue',
  [HighlightColor.Red]: 'red',
  [HighlightColor.Green]: 'green',
  [HighlightColor.Neon]: 'neon',
} as const satisfies Record<HighlightColor, string>

const highlightFiles = import.meta.glob<string>('../assets/highlights/highlight_outline_*.webp', {
  eager: true,
  import: 'default',
})

/** Highlight outline resources. */
export const HIGHLIGHT_OUTLINES: Record<HighlightColor, string> = {} as Record<HighlightColor, string>

for (const [id, asset] of Object.entries(HIGHLIGHT_ASSETS)) {
  const path = `../assets/highlights/highlight_outline_${asset}.webp`
  const outline = highlightFiles[path]

  if (outline) {
    HIGHLIGHT_OUTLINES[Number(id) as HighlightColor] = outline
  }
}