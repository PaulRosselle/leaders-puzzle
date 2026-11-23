import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@fontsource/bebas-neue'
import '@fontsource/jost/400.css'
import { SettingsProvider } from './settings/SettingsProvider'
import './i18n' // Initializes the translations before the first render.

createRoot(document.getElementById('root')!).render(
  <SettingsProvider>
    <App />
  </SettingsProvider>
)
