// Constructor Global Context - Estado global del constructor
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useDesignStore, rootDesignId } from '../store/designStore'

// ─── Context State ───────────────────────────────────────────────────

interface ConstructorContextState {
  // UI State
  activeView: 'editor' | 'preview'
  sidebarOpen: boolean
  activeTool: 'select' | 'text' | 'image' | 'div'
  
  // Canvas State
  zoom: number
  showGrid: boolean
  showGuides: boolean
  
  // Actions
  setActiveView: (view: 'editor' | 'preview') => void
  setSidebarOpen: (open: boolean) => void
  setActiveTool: (tool: 'select' | 'text' | 'image' | 'div') => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  toggleGuides: () => void
}

const ConstructorContext = createContext<ConstructorContextState | null>(null)

// ─── Provider ───────────────────────────────────────────────────────

export function ConstructorProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'image' | 'div'>('select')
  const [zoom, setZoom] = useState(0.4)
  const [showGrid, setShowGrid] = useState(false)
  const [showGuides, setShowGuides] = useState(true)
  
  const toggleGrid = useCallback(() => setShowGrid(g => !g), [])
  const toggleGuides = useCallback(() => setShowGuides(g => !g), [])
  
  return (
    <ConstructorContext.Provider value={{
      activeView,
      sidebarOpen,
      activeTool,
      zoom,
      showGrid,
      showGuides,
      setActiveView,
      setSidebarOpen,
      setActiveTool,
      setZoom,
      toggleGrid,
      toggleGuides,
    }}>
      {children}
    </ConstructorContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────

export function useConstructor() {
  const context = useContext(ConstructorContext)
  if (!context) {
    throw new Error('useConstructor must be used within ConstructorProvider')
  }
  return context
}

// ─── Quick Actions Hook ───────────────────────────────────────────────

export function useConstructorActions() {
  const { addNode, patchNode, selectOne, deleteSelected, moveNodes } = useDesignStore()
  
  const quickAddText = useCallback(() => addNode('text'), [addNode])
  const quickAddImage = useCallback(() => addNode('image'), [addNode])
  const quickAddDiv = useCallback(() => addNode('div'), [addNode])
  
  const quickDelete = useCallback(() => deleteSelected(), [deleteSelected])
  
  const quickMove = useCallback((id: string, dx: number, dy: number) => {
    moveNodes([id], { x: dx, y: dy })
  }, [moveNodes])
  
  return {
    quickAddText,
    quickAddImage,
    quickAddDiv,
    quickDelete,
    quickMove,
  }
}

// Export defaults
export default {
  ConstructorProvider,
  useConstructor,
  useConstructorActions,
}