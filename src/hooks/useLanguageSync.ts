import { useEffect } from 'react'
import i18n from '../i18n'
import { useSettings } from '../settings/useSettings'

/**
 * Applies the language chosen in the settings: the texts (i18next) and the
 * `lang` attribute of the page (screen readers, hyphenation, translation tools).
 */
export function useLanguageSync(): void {
  const { settings } = useSettings()

  useEffect(() => {
    void i18n.changeLanguage(settings.language)
    document.documentElement.lang = settings.language
  }, [settings.language])
}
