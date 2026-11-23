export const TOOLBAR_POSITIONS = ['left', 'right'] as const
export type ToolbarPosition = (typeof TOOLBAR_POSITIONS)[number]

export const LANGUAGES = ['fr', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

/** French if the browser is in French (`fr`, `fr-CA`...), English otherwise. */
export function detectLanguage(): Language {
  const browserLanguage = typeof navigator === 'undefined' ? '' : navigator.language
  return browserLanguage.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

/** Speeds of the animations, ordered from the slowest to the fastest (1 = normal). */
export const ANIMATION_SPEED_LEVELS: readonly number[] = [0.5, 0.75, 1, 1.5, 2]

export type Settings = {
  /** Displays the coordinates on each cell of the board. */
  showBoardCoordinates: boolean
  /** One of ANIMATION_SPEED_LEVELS (the higher, the faster). */
  animationSpeed: number
  /** Plays an animation on the characters the player can interact with. */
  playableAnimation: boolean
  toolbarPosition: ToolbarPosition
  language: Language
}

export const DEFAULT_SETTINGS: Settings = {
  showBoardCoordinates: false,
  animationSpeed: 1,
  playableAnimation: true,
  toolbarPosition: 'left',
  // Only used until the player picks a language (the saved choice always wins).
  language: detectLanguage(),
}

/** `ActionAnimator` works with a multiplier of the durations: slower = bigger. */
export function getAnimationDurationMultiplier(animationSpeed: number): number {
  return 1 / animationSpeed
}