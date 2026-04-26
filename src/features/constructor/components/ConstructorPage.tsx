// Constructor Page - Heavy module, lazy loaded
// Uses designStore for state management
// Includes ImageEditor for image manipulation

import { useState, useCallback, useEffect } from 'react'
import { useDesignStore, rootDesignId } from '../store/designStore'
import { ImageEditor } from './ImageEditor'
import { ExportPanel } from './ExportPanel'
import { LayersPanel } from './panels/LayersPanel'

interface ConstructorPageProps {
  onSaved?: () => void
}

// ─── Toolbar ──────────────────────────────────────────────────────────────

function Toolbar({ onAddNode, onUndo, onRedo, canUndo, canRedo }: {
  onAddNode: (type: 'text' | 'image' | 'div') => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}) {
  const tools = [
    { type: 'text' as const, label: 'Aa', title: 'Texto' },
    { type: 'image' as const, label: '🖼', title: 'Imagen' },
    { type: 'div' as const, label: '□', title: 'Contenedor' },
  ]

  return (
    <div className="h-12 bg-surface border-b border-border flex items-center px-4 gap-2">
      {tools.map(t => (
        <button
          key={t.type}
          onClick={() => onAddNode(t.type)}
          className="w-10 h-10 flex items-center justify-center bg-bg border border-border rounded hover:border-gold transition-colors text-lg"
          title={t.title}
        >
          {t.label}
        </button>
      ))}
      <div className="w-px h-8 bg-border mx-2" />
      <button onClick={onUndo} disabled={!canUndo} className="px-3 py-1.5 text-xs uppercase disabled:opacity-50 enabled:hover:bg-bg">
        ↩ Undo
      </button>
      <button onClick={onRedo} disabled={!canRedo} className="px-3 py-1.5 text-xs uppercase disabled:opacity-50 enabled:hover:bg-bg">
        ↪ Redo
      </button>
    </div>
  )
}

// ─── Canvas with zoom and drag ─────────────────────────────────────────────────

function Canvas({ nodes, selectedIds, onSelect, canvasBg }: {
  nodes: Record<string, any>
  selectedIds: string[]
  onSelect: (id: string) => void
  canvasBg: string
}) {
  const [zoom, setZoom] = useState(0.4)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const root = nodes[rootDesignId]
  if (!root) return null

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onSelect(id)
  }

  const isSelected = (id: string) => selectedIds.includes(id)

  return (
    <div className="flex-1 overflow-hidden bg-bg relative">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-surface rounded shadow-lg p-1">
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.1))} className="w-6 h-6 text-xs hover:bg-bg rounded">−</button>
        <span className="px-2 py-1 text-xs min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="w-6 h-6 text-xs hover:bg-bg rounded">+</button>
        <button onClick={() => setZoom(0.4)} className="px-2 py-1 text-xs hover:bg-bg rounded">Reset</button>
      </div>
      
      {/* Scrollable area */}
      <div className="w-full h-full overflow-auto p-8">
        <div
          className="relative shadow-lg mx-auto"
          style={{
            width: root.size.w * zoom,
            height: root.size.h * zoom,
            background: canvasBg,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onSelect(rootDesignId)
          }}
        >
          {root.children.map((id: string) => {
            const node = nodes[id]
            if (!node || node.visible === false) return null
            return (
              <div
                key={id}
                className={`absolute cursor-move ${isSelected(id) ? 'ring-2 ring-gold' : ''}`}
                style={{
                  left: node.position.x * zoom,
                  top: node.position.y * zoom,
                  width: node.size.w * zoom,
                  height: node.size.h * zoom,
                  backgroundColor: node.styles?.background,
                  borderRadius: node.styles?.borderRadius,
                  padding: node.styles?.padding ? Number(node.styles.padding) * zoom : 0,
                  fontSize: ((node.styles?.fontSize as number) || 24) * zoom,
                  color: node.styles?.color,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(id)
                }}
                onMouseDown={(e) => handleMouseDown(e, id)}
              >
                {node.type === 'text' && node.content?.text}
                {node.type === 'image' && node.content?.src && (
                  <img 
                    src={node.content.src} 
                    alt={node.content.alt || ''} 
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                )}
                {node.type === 'div' && node.children?.length > 0 && (
                  <div className="text-xs text-text-dim">{node.children.length} children</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Inspector ─────────────────────────────────────────────────────────

function Inspector({ selectedIds, nodes, onUpdate, onDelete }: {
  selectedIds: string[]
  nodes: Record<string, any>
  onUpdate: (id: string, patch: any) => void
  onDelete: () => void
}) {
  const selectedId = selectedIds[0]
  const node = selectedId ? nodes[selectedId] : null

  if (!node || selectedIds.length === 0) {
    return (
      <div className="w-64 bg-surface border-l border-border p-4">
        <p className="text-text-dim text-xs">Select an element</p>
      </div>
    )
  }

  return (
    <div className="w-64 bg-surface border-l border-border p-4 overflow-auto">
      <div className="text-xs uppercase tracking-wider mb-4 text-text-dim">{node.type}</div>
      
      {/* Position */}
      <div className="mb-4">
        <label className="text-xs text-text-dim block mb-1">Position</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={node.position.x}
            onChange={(e) => onUpdate(node.id, { position: { ...node.position, x: Number(e.target.value) } })}
            className="w-20 px-2 py-1 bg-bg border border-border text-xs"
          />
          <input
            type="number"
            value={node.position.y}
            onChange={(e) => onUpdate(node.id, { position: { ...node.position, y: Number(e.target.value) } })}
            className="w-20 px-2 py-1 bg-bg border border-border text-xs"
          />
        </div>
      </div>

      {/* Size */}
      <div className="mb-4">
        <label className="text-xs text-text-dim block mb-1">Size</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={node.size.w}
            onChange={(e) => onUpdate(node.id, { size: { ...node.size, w: Number(e.target.value) } })}
            className="w-20 px-2 py-1 bg-bg border border-border text-xs"
          />
          <input
            type="number"
            value={node.size.h}
            onChange={(e) => onUpdate(node.id, { size: { ...node.size, h: Number(e.target.value) } })}
            className="w-20 px-2 py-1 bg-bg border border-border text-xs"
          />
        </div>
      </div>

      {/* Text content */}
      {node.type === 'text' && (
        <div className="mb-4">
          <label className="text-xs text-text-dim block mb-1">Text</label>
          <textarea
            value={(node.content as any)?.text || ''}
            onChange={(e) => onUpdate(node.id, { content: { text: e.target.value } })}
            className="w-full px-2 py-1 bg-bg border border-border text-xs h-20"
          />
        </div>
      )}

      {/* Image editor */}
      {node.type === 'image' && (
        <div className="mb-4">
          <label className="text-xs text-text-dim block mb-1">Image</label>
          {(node.content as any)?.src ? (
            <div className="relative">
              <img 
                src={(node.content as any).src} 
                alt={(node.content as any).alt || ''} 
                className="w-full h-32 object-contain bg-bg rounded mb-2"
              />
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('jme:openImageEditor', { 
                    detail: { 
                      imageUrl: (node.content as any).src,
                      onSave: (url: string) => onUpdate(node.id, { content: { src: url, alt: (node.content as any).alt || '' } })
                    } 
                  }))
                }}
                className="w-full py-2 bg-bg border border-border text-xs uppercase hover:border-gold"
              >
                Change Image
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('jme:openImageEditor', { 
                  detail: { 
                    onSave: (url: string) => onUpdate(node.id, { content: { src: url, alt: '' } })
                  } 
                }))
              }}
              className="w-full py-2 bg-gold text-[#0a0808] text-xs uppercase"
            >
              Add Image
            </button>
          )}
        </div>
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-full py-2 bg-red-500/10 text-red-500 text-xs uppercase tracking-wider hover:bg-red-500/20"
      >
        Delete
      </button>
    </div>
  )
}

// ─── Main Constructor Page ───────────────────────────────────────────────

export function ConstructorPage({ onSaved }: ConstructorPageProps) {
  const {
    nodes,
    selectedIds,
    canvasBackground,
    historyIndex,
    history,
    addNode,
    patchNode,
    selectOne,
    deleteSelected,
    undo,
    redo,
  } = useDesignStore()

  // Image editor state
  const [imageEditorOpen, setImageEditorOpen] = useState(false)
  const [imageEditorConfig, setImageEditorConfig] = useState<{
    imageUrl?: string
    onSave: (url: string) => void
  }>({ onSave: () => {} })

  // Export panel state
  const [exportPanelOpen, setExportPanelOpen] = useState(false)
  const [exportPanelConfig, setExportPanelConfig] = useState<{
    design: { nodes: any; canvas: any }
    onExportComplete: (url: string) => void
  }>({ design: { nodes: {}, canvas: {} }, onExportComplete: () => {} })

  // Listen for events
  useEffect(() => {
    const imgHandler = (e: CustomEvent) => {
      setImageEditorConfig(e.detail)
      setImageEditorOpen(true)
    }
    window.addEventListener('jme:openImageEditor', imgHandler as EventListener)
    return () => window.removeEventListener('jme:openImageEditor', imgHandler as EventListener)
  }, [])

  useEffect(() => {
    const expHandler = (e: CustomEvent) => {
      setExportPanelConfig(e.detail)
      setExportPanelOpen(true)
    }
    window.addEventListener('jme:openExportPanel', expHandler as EventListener)
    return () => window.removeEventListener('jme:openExportPanel', expHandler as EventListener)
  }, [])

  const handleAddNode = useCallback((type: 'text' | 'image' | 'div') => {
    addNode(type)
  }, [addNode])

  const handleUpdate = useCallback((id: string, patch: any) => {
    patchNode(id, patch)
  }, [patchNode])

  const handleDelete = useCallback(() => {
    deleteSelected()
  }, [deleteSelected])

  const handleSave = useCallback(() => {
    window.dispatchEvent(new CustomEvent('jme:openExportPanel', { 
      detail: { 
        design: { nodes, canvas: { width: 1200, height: 1600, background: canvasBackground } },
        onExportComplete: (url: string) => {
          console.log('Exported:', url)
          onSaved?.()
        }
      } 
    }))
  }, [nodes, canvasBackground, onSaved])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="h-12 bg-surface border-b border-border flex items-center px-4 gap-4">
        <h1 className="text-sm tracking-wider uppercase">Editor de Diseño</h1>
        <div className="flex-1" />
        <input
          type="color"
          value={canvasBackground}
          onChange={(e) => useDesignStore.getState().setCanvasBackground(e.target.value)}
          className="w-8 h-8 cursor-pointer"
        />
        <button onClick={handleSave} className="px-4 py-1.5 bg-gold text-[#0a0808] text-xs uppercase tracking-wider">
          Export / Guardar
        </button>
      </div>

      {/* Toolbar */}
      <Toolbar
        onAddNode={handleAddNode}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Main area */}
      <div className="flex-1 flex">
        {/* Layers Panel */}
        <LayersPanel />
        
        {/* Canvas */}
        <Canvas
          nodes={nodes}
          selectedIds={selectedIds}
          onSelect={selectOne}
          canvasBg={canvasBackground}
        />
        <Inspector
          selectedIds={selectedIds}
          nodes={nodes}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>

      {/* Image Editor */}
      {imageEditorOpen && (
        <ImageEditor
          imageUrl={imageEditorConfig.imageUrl}
          onSave={(url) => {
            imageEditorConfig.onSave(url)
            setImageEditorOpen(false)
          }}
          onCancel={() => setImageEditorOpen(false)}
        />
      )}

      {/* Export Panel */}
      {exportPanelOpen && (
        <ExportPanel
          design={exportPanelConfig.design}
          onExportComplete={(url) => {
            exportPanelConfig.onExportComplete(url)
            setExportPanelOpen(false)
          }}
          onCancel={() => setExportPanelOpen(false)}
        />
      )}
    </div>
  )
}

export default ConstructorPage