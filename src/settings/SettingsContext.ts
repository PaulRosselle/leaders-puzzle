import { createContext } from 'react'
import type { Settings } from './Settings'

export type SettingsContextValue = {
  settings: Settings
  /** Applies the change immediately and saves it. */
  updateSettings: (changes: Partial<Settings>) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)