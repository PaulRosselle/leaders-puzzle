import { HighlightColor } from '../data/HighlightColor'
import {
  ANIMATION_SPEED_LEVELS,
  DEFAULT_SETTINGS,
  LANGUAGES,
  PUZZLE_SORTS,
  TOOLBAR_POSITIONS,
  type Settings,
} from './Settings'

const STORAGE_KEY = 'leaders.settings'

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function pickOption<T>(value: unknown, options: readonly T[], fallback: T): T {
  return options.find((option) => option === value) ?? fallback
}

/**
 * Reads the saved settings. Each field is checked on its own and falls back to
 * its default value if it is missing or invalid (new setting, old save, edited
 * storage...), so a bad value never breaks the app.
 */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const saved: unknown = raw === null ? null : JSON.parse(raw)

    if (typeof saved !== 'object' || saved === null) {
      return DEFAULT_SETTINGS
    }

    const record = saved as Record<string, unknown>

    return {
      showBoardCoordinates: pickBoolean(record.showBoardCoordinates, DEFAULT_SETTINGS.showBoardCoordinates),
      animationSpeed: pickOption(record.animationSpeed, ANIMATION_SPEED_LEVELS, DEFAULT_SETTINGS.animationSpeed),
      playableAnimation: pickBoolean(record.playableAnimation, DEFAULT_SETTINGS.playableAnimation),
      highlightColor: pickOption(record.highlightColor,
        Object.values(HighlightColor).filter((value): value is HighlightColor => typeof value === 'number'),
        DEFAULT_SETTINGS.highlightColor,
      ),
      toolbarPosition: pickOption(record.toolbarPosition, TOOLBAR_POSITIONS, DEFAULT_SETTINGS.toolbarPosition),
      language: pickOption(record.language, LANGUAGES, DEFAULT_SETTINGS.language),
      puzzleSort: pickOption(record.puzzleSort, PUZZLE_SORTS, DEFAULT_SETTINGS.puzzleSort),
    }
  } catch {
    // Storage unavailable (private mode...) or corrupted JSON.
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Nothing to do: the settings simply will not survive a reload.
  }
}