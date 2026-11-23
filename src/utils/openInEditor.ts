import { GameUrlWriter } from '../data/parser/export/GameUrlWriter'
import type { GameContext } from '../gamelogic/entities/states/GameContext'

export const EDITOR_URL = 'https://mthbrt.github.io/Leaders-editor/'

/**
 * Opens the editor in a new tab, loaded with the state of `context`
 * (same `#white=...&black=...` format as this app: see GameStateSerializer).
 */
export function openInEditor(context: GameContext): void {
  // Array.from: GameStateSerializer expects a mutable array.
  const url = GameUrlWriter.writer(Array.from(context.getCharacterStates()), EDITOR_URL)

  // `noopener`: the editor gets no access to this window.
  window.open(url, '_blank', 'noopener,noreferrer')
}