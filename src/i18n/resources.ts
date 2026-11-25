import type { Language } from '../settings/Settings'

import frEndGame from './locales/fr/endGame.json'
import frImportModal from './locales/fr/importModal.json'
import frPieces from './locales/fr/pieces.json'
import frPortraits from './locales/fr/portraits.json'
import frSettings from './locales/fr/settings.json'
import frToolbar from './locales/fr/toolbar.json'
import frPuzzles from './locales/fr/puzzles.json'
import frPuzzleErrors from './locales/fr/puzzleErrors.json'

import enEndGame from './locales/en/endGame.json'
import enImportModal from './locales/en/importModal.json'
import enPieces from './locales/en/pieces.json'
import enPortraits from './locales/en/portraits.json'
import enSettings from './locales/en/settings.json'
import enToolbar from './locales/en/toolbar.json'
import enPuzzles from './locales/en/puzzles.json'
import enPuzzleErrors from './locales/en/puzzleErrors.json'
/*
 * One JSON file per namespace (= one area of the UI), one folder per language.
 *
 * To add a namespace: create `locales/fr/<name>.json` and `locales/en/<name>.json`,
 * then add one line for each language below. The types of `t()` follow.
 */
export const fr = {
  endGame: frEndGame,
  importModal: frImportModal,
  pieces: frPieces,
  portraits: frPortraits,
  settings: frSettings,
  toolbar: frToolbar,
  puzzles: frPuzzles,
  puzzleErrors: frPuzzleErrors,
}

export const en = {
  endGame: enEndGame,
  importModal: enImportModal,
  pieces: enPieces,
  portraits: enPortraits,
  settings: enSettings,
  toolbar: enToolbar,
  puzzles: enPuzzles,
  puzzleErrors: enPuzzleErrors,
}

export const resources = { fr, en } satisfies Record<Language, unknown>

/** French is the reference: its JSON files define the keys accepted by `t()`. */
export type Resources = typeof fr

type SameShape<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

/**
 * Compilation fails here ("false" does not satisfy "true") when a key exists
 * in one language and not in the other: compare the two JSON files of the
 * namespace you just edited.
 */
export type TranslationsAreComplete = SameShape<typeof fr, typeof en> extends true ? true : never
const translationsAreComplete: TranslationsAreComplete = true
void translationsAreComplete
