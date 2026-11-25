const STORAGE_KEY = 'leaders.completedPuzzles'

/** Ids of the official puzzles the player has won. */
export function loadCompletedPuzzleIds(): ReadonlySet<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const saved: unknown = raw === null ? null : JSON.parse(raw)

    if (!Array.isArray(saved)) return new Set()

    return new Set(saved.filter((value): value is number => Number.isInteger(value)))
  } catch {
    // Storage unavailable (private mode...) or corrupted JSON.
    return new Set()
  }
}

export function markPuzzleCompleted(id: number): void {
  const ids = loadCompletedPuzzleIds()
  if (ids.has(id)) return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]))
  } catch {
    // Nothing to do: the progress simply will not survive a reload.
  }
}