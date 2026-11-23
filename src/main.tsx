import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@fontsource/bebas-neue'
import '@fontsource/jost/400.css'
import { SettingsProvider } from './settings/SettingsProvider'

createRoot(document.getElementById('root')!).render(
  <SettingsProvider>
    <App />
  </SettingsProvider>
)
