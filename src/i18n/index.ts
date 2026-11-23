import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { loadSettings } from '../settings/settingsStorage'
import { resources } from './resources'

// Everything is bundled (no request at runtime): nothing depends on the base
// path of the site, which is what GitHub Pages needs under `/<repository>/`.
void i18n.use(initReactI18next).init({
  resources,
  lng: loadSettings().language,
  fallbackLng: 'fr',
  // The translations are already there: `t()` can be used right after `init()`.
  initAsync: false,
  // React already escapes what it renders.
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export default i18n
