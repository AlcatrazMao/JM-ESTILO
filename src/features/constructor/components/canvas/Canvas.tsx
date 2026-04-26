// Canvas with full drag and drop support - FIXED

import { useState, useRef, useCallback, useEffect } from 'react'
import { useDesignStore, rootDesignId } from '../../store/designStore'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

interface CanvasProps {
  zoom: number
  onZoomChange?: (zoom: number) => void
}

export function Canvas({ zoom, onZoomChange }: CanvasProps) {
  const { nodes, selectedIds, canvasBackground, selectOne, patchNode, addNode } = useDesignStore()
  const root = nodes[rootDesignId]
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragNodeId, setDragNodeId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, nodeX: 0, nodeY: 0 })
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addMenuPos, setAddMenuPos] = useState({ x: 0, y: 0 })
  
  const canvasRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcuts
  useKeyboardShortcuts({})

  // Prevent context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Mouse handlers for drag
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return
    e.stopPropagation()
    
    const node = nodes[nodeId]
    if (!node || node.locked) return
    
    selectOne(nodeId)
    setDragNodeId(nodeId)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      nodeX: node.position.x,
      nodeY: node.position.y,
    })
    setIsDragging(true)
  }, [nodes, selectOne])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragNodeId) return
    
    const dx = (e.clientX - dragStart.x) / zoom
    const dy = (e.clientY - dragStart.y) / zoom
    
    const newX = Math.round(dragStart.nodeX + dx)
    const newY = Math.round(dragStart.nodeY + dy)
    
    patchNode(dragNodeId, { 
      position: { x: newX, y: newY } 
    })
  }, [isDragging, dragNodeId, dragStart, zoom, patchNode])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragNodeId(null)
  }, [])

  // Global mouse up
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp()
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging, handleMouseUp])

  // Add menu handler
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAddMenuPos({ x: e.clientX, y: e.clientY })
    setShowAddMenu(true)
  }, [])

  const handleAddNode = useCallback((type: 'text' | 'image' | 'div') => {
    // Calculate position relative to canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) return
    
    const x = Math.round((addMenuPos.x - canvasRect.left) / zoom - 100)
    const y = Math.round((addMenuPos.y - canvasRect.top) / zoom - 40)
    
    const newId = addNode(type)
    patchNode(newId, {
      position: { x: Math.max(0, x), y: Math.max(0, y) }
    })
    selectOne(newId)
    setShowAddMenu(false)
  }, [addMenuPos, zoom, addNode, patchNode, selectOne])

  // Close add menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowAddMenu(false)
    if (showAddMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showAddMenu])

  if (!root) return null

  // Helper to get node content safely
  const getNodeContent = (node: any) => {
    if (node.type === 'text') return node.content?.text || ''
    if (node.type === 'image') return node.content?.src || ''
    return ''
  }

  return (
    <div 
      className="flex-1 overflow-hidden bg-bg relative"
      onContextMenu={handleContextMenu}
    >
      {/* Zoom controls - better positioned */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-surface rounded-lg shadow-lg p-1">
        <button 
          onClick={() => onZoomChange?.(Math.max(zoom - 0.1, 0.1))} 
          className="w-7 h-7 flex items-center justify-center text-xs hover:bg-bg rounded"
        >
          −
        </button>
        <span className="px-2 py-1 text-xs min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
        <button 
          onClick={() => onZoomChange?.(Math.min(zoom + 0.1, 2))} 
          className="w-7 h-7 flex items-center justify-center text-xs hover:bg-bg rounded"
        >
          +
        </button>
      </div>

      {/* Add menu hint */}
      <div className="absolute bottom-2 left-2 z-10 text-xs text-text-dim bg-surface/80 px-2 py-1 rounded">
        Doble clic para agregar elemento
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="w-full h-full overflow-auto p-8"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div
          className="relative shadow-lg mx-auto"
          style={{
            width: root.size.w * zoom,
            height: root.size.h * zoom,
            backgroundColor: canvasBackground || '#ffffff',
            backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              selectOne(rootDesignId)
              setShowAddMenu(false)
            }
          }}
          onContextMenu={handleContextMenu}
        >
          {root.children.map((id: string) => {
            const node = nodes[id]
            if (!node || node.visible === false) return null
            
            const isSelected = selectedIds.includes(id)
            const isBeingDragged = dragNodeId === id
            
            const bgColor = node.styles?.background as string || 'transparent'
            const textColor = node.styles?.color as string || '#000000'
            const fontSize = ((node.styles?.fontSize as number) || 24) * zoom
            const padding = (node.styles?.padding ? Number(node.styles.padding) : 0) * zoom
            const radius = (node.styles?.borderRadius ? Number(node.styles.borderRadius) : 0) * zoom
            
            const content = getNodeContent(node)
            const isImage = node.type === 'image'
            
            return (
              <div
                key={id}
                className={`absolute cursor-move transition-shadow select-none ${
                  isSelected ? 'ring-2 ring-gold shadow-lg' : ''
                } ${isBeingDragged ? 'opacity-80' : ''}`}
                style={{
                  left: node.position.x * zoom,
                  top: node.position.y * zoom,
                  width: node.size.w * zoom,
                  height: node.size.h * zoom,
                  backgroundColor: bgColor,
                  borderRadius: radius,
                  padding: padding,
                  fontSize: fontSize,
                  color: textColor,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  selectOne(id)
                }}
                onMouseDown={(e) => handleMouseDown(e, id)}
                onContextMenu={handleContextMenu}
              >
                {/* Content */}
                {!isImage && content}
                {isImage && content && (
                  <img 
                    src={content} 
                    alt="" 
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                )}
                {!isImage && !content && (
                  <span className="text-text-dim text-xs">Empty</span>
                )}
                
                {/* Resize handle */}
                {isSelected && (
                  <div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-gold rounded-sm cursor-se-resize"
                    style={{ transform: 'scale(0.5)' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Node Menu */}
      {showAddMenu && (
        <div 
          className="fixed bg-surface shadow-lg rounded-lg p-2 z-50"
          style={{ left: addMenuPos.x, top: addMenuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleAddNode('text')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-dim rounded"
          >
            📝 Agregar Texto
          </button>
          <button
            onClick={() => handleAddNode('image')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-dim rounded"
          >
            🖼️ Agregar Imagen
          </button>
          <button
            onClick={() => handleAddNode('div')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-bg-dim rounded"
          >
            ▢ Agregar Caja
          </button>
        </div>
      )}
    </div>
  )
}

export default Canvas