// Constructor Toolbar - Tools and actions

import { useConstructor, useConstructorActions } from '../../context/ConstructorContext'
import { useDesignStore } from '../../store/designStore'

// Tool definitions
interface Tool {
  id: string
  label: string
  icon: string
  shortcut?: string
  action: () => void
}

export function TopToolbar() {
  const { activeTool, setActiveTool, showGrid, toggleGrid, showGuides, toggleGuides } = useConstructor()
  const { undo, redo, historyIndex, history } = useDesignStore()
  
  const tools: Tool[] = [
    { id: 'select', label: 'Select', icon: '⬚', shortcut: 'V', action: () => setActiveTool('select') },
    { id: 'text', label: 'Text', icon: 'Aa', shortcut: 'T', action: () => setActiveTool('text') },
    { id: 'image', label: 'Image', icon: '🖼', shortcut: 'I', action: () => setActiveTool('image') },
    { id: 'div', label: 'Div', icon: '□', shortcut: 'D', action: () => setActiveTool('div') },
  ]
  
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  
  return (
    <div className="h-12 bg-surface border-b border-border flex items-center px-4 gap-2">
      {/* Logo */}
      <div className="font-serif text-sm tracking-wider mr-4">
        JM <span className="text-gold">Editor</span>
      </div>
      
      {/* Tools */}
      <div className="flex gap-1">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={tool.action}
            className={`w-9 h-9 flex items-center justify-center rounded text-lg transition-colors ${
              activeTool === tool.id 
                ? 'bg-gold text-[#0a0808]' 
                : 'bg-bg border border-border hover:border-gold'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      
      <div className="w-px h-8 bg-border mx-2" />
      
      {/* Undo/Redo */}
      <button 
        onClick={undo} 
        disabled={!canUndo}
        className="px-3 py-1.5 text-xs uppercase disabled:opacity-30 enabled:hover:bg-bg rounded"
        title="Undo (Ctrl+Z)"
      >
        ↩
      </button>
      <button 
        onClick={redo} 
        disabled={!canRedo}
        className="px-3 py-1.5 text-xs uppercase disabled:opacity-30 enabled:hover:bg-bg rounded"
        title="Redo (Ctrl+Y)"
      >
        ↪
      </button>
      
      <div className="flex-1" />
      
      {/* View toggles */}
      <button
        onClick={toggleGrid}
        className={`px-2 py-1 text-xs rounded ${showGrid ? 'bg-gold text-[#0a0808]' : 'bg-bg'}`}
        title="Toggle Grid"
      >
        Grid
      </button>
      <button
        onClick={toggleGuides}
        className={`px-2 py-1 text-xs rounded ${showGuides ? 'bg-gold text-[#0a0808]' : 'bg-bg'}`}
        title="Toggle Guides"
      >
        Guides
      </button>
    </div>
  )
}

export function ToolbarActions() {
  const { zoom, setZoom } = useConstructor()
  const { addNode } = useDesignStore()
  
  const quickAddText = () => addNode('text')
  const quickAddImage = () => addNode('image')
  const quickAddDiv = () => addNode('div')
  const quickDelete = () => useDesignStore.getState().deleteSelected()
  
  return (
    <div className="flex items-center gap-2">
      {/* Add buttons - prominent */}
      <button onClick={quickAddText} className="px-3 py-1.5 text-xs bg-gold text-surface font-bold rounded hover:bg-gold/80">
        +Aa Texto
      </button>
      <button onClick={quickAddImage} className="px-3 py-1.5 text-xs bg-gold text-surface font-bold rounded hover:bg-gold/80">
        +🖼 Imagen
      </button>
      <button onClick={quickAddDiv} className="px-3 py-1.5 text-xs bg-gold text-surface font-bold rounded hover:bg-gold/80">
        +▢ Caja
      </button>
      
      <div className="w-px h-6 bg-border" />
      
      {/* Delete */}
      <button onClick={quickDelete} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-500 rounded hover:bg-red-500/20">
        🗑 Delete
      </button>
      
      <div className="flex-1" />
      
      {/* Zoom controls */}
      <div className="flex items-center gap-1 bg-bg rounded px-2 py-1">
        <button onClick={() => setZoom(Math.max(zoom - 0.1, 0.1))} className="w-6 h-6 text-xs hover:bg-surface rounded">
          −
        </button>
        <span className="text-xs min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(zoom + 0.1, 2))} className="w-6 h-6 text-xs hover:bg-surface rounded">
          +
        </button>
        <button onClick={() => setZoom(0.4)} className="px-2 py-1 text-xs hover:bg-surface rounded">
          Fit
        </button>
      </div>
    </div>
  )
}

export default {
  TopToolbar,
  ToolbarActions,
}