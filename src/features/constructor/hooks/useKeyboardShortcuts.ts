// Keyboard shortcuts for constructor
import { useEffect } from 'react'
import { useDesignStore } from '../store/designStore'

interface UseKeyboardShortcutsOptions {
  onSave?: () => void
}

export function useKeyboardShortcuts({
  onSave,
}: UseKeyboardShortcutsOptions = {}) {
  const { deleteSelected, moveNodes, undo, redo, copySelected, paste, duplicateSelected } = useDesignStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Meta/Ctrl keys
      const isMeta = e.metaKey || e.ctrlKey

      // Delete: Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
        return
      }

      // Copy: Ctrl+C
      if (isMeta && e.key === 'c') {
        copySelected()
        return
      }

      // Paste: Ctrl+V
      if (isMeta && e.key === 'v') {
        e.preventDefault()
        paste()
        return
      }

      // Duplicate: Ctrl+D
      if (isMeta && e.key === 'd') {
        e.preventDefault()
        duplicateSelected()
        return
      }

      // Undo: Ctrl+Z
      if (isMeta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (isMeta && (e.key === 'z' && e.shiftKey || e.key === 'y')) {
        e.preventDefault()
        redo()
        return
      }

      // Save: Ctrl+S
      if (isMeta && e.key === 's') {
        e.preventDefault()
        onSave?.()
        return
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        useDesignStore.getState().clearSelection()
        return
      }

      // Arrow keys: Nudge selected elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const { selectedIds, moveNodes } = useDesignStore.getState()
        if (selectedIds.length > 0) {
          e.preventDefault()
          const step = e.shiftKey ? 10 : 1
          const delta = {
            ArrowUp: { x: 0, y: -step },
            ArrowDown: { x: 0, y: step },
            ArrowLeft: { x: -step, y: 0 },
            ArrowRight: { x: step, y: 0 },
          }[e.key]!
          moveNodes(selectedIds, delta)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, moveNodes, undo, redo, onSave, copySelected, paste, duplicateSelected])
}

// Shortcut keys display helper
export const SHORTCUTS = [
  { keys: ['Delete'], action: 'Delete selected' },
  { keys: ['Ctrl', 'C'], action: 'Copy' },
  { keys: ['Ctrl', 'V'], action: 'Paste' },
  { keys: ['Ctrl', 'D'], action: 'Duplicate' },
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Ctrl', 'S'], action: 'Save' },
  { keys: ['Esc'], action: 'Deselect' },
  { keys: ['Arrows'], action: 'Move 1px (10px with Shift)' },
]

export default useKeyboardShortcuts