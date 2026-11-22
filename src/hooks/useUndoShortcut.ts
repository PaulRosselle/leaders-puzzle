import { useEffect } from 'react'

/**
 * Calls `undo` when the user presses Ctrl+Z (or Cmd+Z on macOS),
 * but only if `canUndo` is true.
 */
export function useUndoShortcut(canUndo: boolean, undo: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // `event.key` depends on the keyboard layout, so it also works on AZERTY.
      const isUndoShortcut =
        (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z'

      // Ignore auto-repeat so that holding the keys down undoes only once.
      if (!isUndoShortcut || event.repeat) {
        return
      }

      // Avoid the browser's own handling of the shortcut.
      event.preventDefault()

      if (canUndo) {
        undo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Cleanup: the listener is removed (and re-added with fresh values) when
    // `canUndo` or `undo` change, or when the component unmounts.
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, undo])
}