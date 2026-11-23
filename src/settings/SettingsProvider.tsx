import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Settings } from './Settings'
import { SettingsContext } from './SettingsContext'
import { loadSettings, saveSettings } from './settingsStorage'

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Read synchronously: the first render already uses the saved settings.
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const updateSettings = useCallback((changes: Partial<Settings>) => {
    setSettings((previous) => ({ ...previous, ...changes }))
  }, [])

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}