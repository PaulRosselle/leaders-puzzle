/**
 * Puts `code` in the URL hash and reloads the page, which then starts
 * with this puzzle.
 */
export function reloadWithPuzzle(code: string): void {
  const args = code.startsWith('#') ? code : `#${code}`
  // replaceState: no extra history entry (the "back" button would otherwise
  // come back to a URL that does not match the puzzle displayed).
  history.replaceState(null, '', args)
  window.location.reload()
}