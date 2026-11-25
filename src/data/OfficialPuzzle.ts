import officialPuzzles from '../resources/official_puzzles.json'
import type { PuzzleSort } from '../settings/Settings'

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Extreme'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export type OfficialPuzzle = {
  id: number
  difficulty: Difficulty
  /** Arguments to put in the URL (e.g. `#white=...&black=...`). */
  data: string
  hash: string
}

type DifficultyStyle = {
  /** Number of filled markers (out of `MAX_DIFFICULTY_LEVEL`). */
  level: number
  /** Tint of the crown (white image, masked). */
  crownColor: string
  /** Blend tint of the golden marker (`null` = no tint). */
  markerTint: string | null
}

export const MAX_DIFFICULTY_LEVEL = DIFFICULTIES.length

export const DIFFICULTY_STYLES: Record<Difficulty, DifficultyStyle> = {
  Easy: { level: 1, crownColor: '#B8B221', markerTint: '#BCFF9E' },
  Medium: { level: 2, crownColor: '#F9B235', markerTint: null },
  Hard: { level: 3, crownColor: '#E67409', markerTint: '#ECA62A' },
  Extreme: { level: 4, crownColor: '#C34200', markerTint: '#C85F00' },
}

export const OFFICIAL_PUZZLES = officialPuzzles as OfficialPuzzle[]

export function sortPuzzles(puzzles: readonly OfficialPuzzle[], sort: PuzzleSort): OfficialPuzzle[] {
  return [...puzzles].sort((a, b) => {
    if (sort === 'difficulty') {
      const byDifficulty = DIFFICULTY_STYLES[a.difficulty].level - DIFFICULTY_STYLES[b.difficulty].level
      if (byDifficulty !== 0) return byDifficulty
    }
    return a.id - b.id
  })
}