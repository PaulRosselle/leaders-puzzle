import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@fontsource/jost/400.css'
import { SettingsProvider } from './settings/SettingsProvider'
import './i18n' // Initializes the translations before the first render.
import { preloadImages } from './utils/preloadImages'
import { CHARACTER_ILLUSTRATIONS, LEADER_OUTLINE, PIECE_BACKGROUNDS } from './data/asset/CharacterAsset'
import { HIGHLIGHT_OUTLINES } from './data/asset/HighlightAsset'
import { END_GAME_LEADERS, END_GAME_STYLES, EndGameType } from './data/asset/EndGameAsset'
import { PORTRAIT_SOURCE_URLS } from './data/asset/PortraitAsset'
import { MARKER_IMAGES } from './data/asset/MarkerAsset.ts'

createRoot(document.getElementById('root')!).render(
  <SettingsProvider>
    <App />
  </SettingsProvider>
)

// Once the first render is done, in order of usefulness:
// 1. what appears during the game (new pieces, highlights),
// 2. the end of game modal,
// 3. the portraits shown by a long press.
preloadImages([
  [
    ...Object.values(CHARACTER_ILLUSTRATIONS),
    ...Object.values(PIECE_BACKGROUNDS),
    ...Object.values(HIGHLIGHT_OUTLINES),
    LEADER_OUTLINE,
  ],
  [
    ...Object.values(MARKER_IMAGES),
  ],
  [
    ...Object.values(END_GAME_STYLES).flatMap((style) => [style.leaderBackground, style.side]),
    ...[EndGameType.Victory, EndGameType.Defeat].flatMap((type) =>
      Object.values(END_GAME_LEADERS[type]).filter((url): url is string => url !== undefined),
    ),
  ],
  PORTRAIT_SOURCE_URLS,
])