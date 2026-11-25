import { HighlightColor } from '../highlight/HighlightColor'

export const HIGHLIGHT_ASSETS = {
  [HighlightColor.Default]: 'default',
  [HighlightColor.Blue]: 'blue',
  [HighlightColor.Red]: 'red',
  [HighlightColor.Green]: 'green',
  [HighlightColor.Neon]: 'neon',
} as const satisfies Record<HighlightColor, string>


/** Highlight outline resources. */
const highlightOutlineFiles = import.meta.glob<string>('../../assets/highlights/highlight_outline_*.webp', {
  eager: true,
  import: 'default',
})

export const HIGHLIGHT_OUTLINES: Record<HighlightColor, string> = {} as Record<HighlightColor, string>

for (const [id, asset] of Object.entries(HIGHLIGHT_ASSETS)) {
  const path = `../../assets/highlights/highlight_outline_${asset}.webp`
  const outline = highlightOutlineFiles[path]

  if (outline) {
    HIGHLIGHT_OUTLINES[Number(id) as HighlightColor] = outline
  }
}

/** Highlight color resources. */
const highlightColorFiles = import.meta.glob<string>('../../assets/highlights/highlight_color_*.webp',{
  eager: true,
  import: 'default',
})

export const HIGHLIGHT_COLOR_PREVIEWS: Record<HighlightColor, string> = {} as Record<HighlightColor, string>

for (const [id, asset] of Object.entries(HIGHLIGHT_ASSETS)) {
  const path = `../../assets/highlights/highlight_color_${asset}.webp`
  const preview = highlightColorFiles[path]

  if (preview) {
    HIGHLIGHT_COLOR_PREVIEWS[Number(id) as HighlightColor] = preview
  }
}