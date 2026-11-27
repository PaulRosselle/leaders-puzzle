import { HighlightColor } from "../data/highlight/HighlightColor"

export const TOOLBAR_POSITIONS = ['left', 'right'] as const
export type ToolbarPosition = (typeof TOOLBAR_POSITIONS)[number]

export const LANGUAGES = ['fr', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

export const PUZZLE_SORTS = ['id', 'difficulty'] as const
export type PuzzleSort = (typeof PUZZLE_SORTS)[number]

/** French if the browser is in French (`fr`, `fr-CA`...), English otherwise. */
export function detectLanguage(): Language {
  const browserLanguage = typeof navigator === 'undefined' ? '' : navigator.language
  return browserLanguage.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

/** Speeds of the animations, ordered from the slowest to the fastest (1 = normal). */
export const ANIMATION_SPEED_LEVELS: readonly number[] = [0.5, 0.75, 1, 1.5, 2]

export type Settings = {
  showBoardCoordinates: boolean
  animationSpeed: number
  playableAnimation: boolean
  highlightColor: HighlightColor
  toolbarPosition: ToolbarPosition
  showToolbarLabels: boolean
  language: Language
  puzzleSort: PuzzleSort
}

export const DEFAULT_SETTINGS: Settings = {
  showBoardCoordinates: false,
  animationSpeed: 1,
  playableAnimation: true,
  highlightColor: HighlightColor.Default,
  toolbarPosition: 'left',
  showToolbarLabels: false,
  // Only used until the player picks a language (the saved choice always wins).
  language: detectLanguage(),
  puzzleSort: 'id'
}

/** `ActionAnimator` works with a multiplier of the durations: slower = bigger. */
export function getAnimationDurationMultiplier(animationSpeed: number): number {
  return 1 / animationSpeed
}