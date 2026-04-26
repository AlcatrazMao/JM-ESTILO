// Canvas Interaction - Simplified drag, resize, zoom
// Inspired by PROYECTO_TIENDA's implementation

import { useState, useCallback, useRef, useEffect } from 'react'

interface Point { x: number; y: number }
interface DragState {
  nodeId: string
  startPos: Point
  startMouse: Point
}

interface ResizeState {
  nodeId: string
  direction: string
  startPos: Point
  startSize: { w: number; h: number }
  startMouse: Point
}

interface CanvasInteractionOptions {
  onMoveNode: (id: string, delta: Point) => void
  onResizeNode: (id: string, direction: string, delta: Point, size: { w: number; h: number }) => void
  onSelect: (id: string) => void
  zoom?: number
}

export function useCanvasInteraction({
  onMoveNode,
  onResizeNode,
  onSelect,
  zoom = 1,
}: CanvasInteractionOptions) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [resizeState, setResizeState] = useState<ResizeState | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  const clientToCanvas = useCallback((clientX: number, clientY: number): Point => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    }
  }, [zoom])

  // Mouse down on node - start drag
  const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return
    e.stopPropagation()
    onSelect(nodeId)
    
    const pos = { x: 0, y: 0 } // Will be updated in mouseMove
    setDragState({
      nodeId,
      startPos: pos,
      startMouse: { x: e.clientX, y: e.clientY },
    })
    setIsDragging(true)
  }, [onSelect])

  // Mouse down on resize handle - start resize
  const onResizeMouseDown = useCallback((e: React.MouseEvent, nodeId: string, direction: string) => {
    if (e.button !== 0) return
    e.stopPropagation()
    
    setResizeState({
      nodeId,
      direction,
      startPos: { x: 0, y: 0 }, // Will be updated in mouseMove
      startSize: { w: 100, h: 100 }, // Will be overridden
      startMouse: { x: e.clientX, y: e.clientY },
    })
    setIsResizing(true)
  }, [])

  // Global mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const currentMouse = { x: e.clientX, y: e.clientY }
      const delta = {
        x: (currentMouse.x - (dragState?.startMouse.x || 0)) / zoom,
        y: (currentMouse.y - (dragState?.startMouse.y || 0)) / zoom,
      }
      
      if (isDragging && dragState) {
        onMoveNode(dragState.nodeId, delta)
        setDragState(prev => prev ? { ...prev, startMouse: currentMouse } : null)
      }
      
      if (isResizing && resizeState) {
        const deltaAbs = {
          x: (currentMouse.x - resizeState.startMouse.x) / zoom,
          y: (currentMouse.y - resizeState.startMouse.y) / zoom,
        }
        const newSize = {
          w: resizeState.startSize.w + deltaAbs.x,
          h: resizeState.startSize.h + deltaAbs.y,
        }
        onResizeNode(resizeState.nodeId, resizeState.direction, deltaAbs, newSize)
        setResizeState(prev => prev ? { ...prev, startMouse: currentMouse } : null)
      }
    }

    const handleMouseUp = () => {
      setDragState(null)
      setResizeState(null)
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragState, resizeState, zoom, onMoveNode, onResizeNode])

  return {
    containerRef,
    isDragging,
    isResizing,
    onNodeMouseDown,
    onResizeMouseDown,
  }
}

// Zoom controls
export function useCanvasZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 0.25, 3)), [])
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.25, 0.25)), [])
  const zoomReset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [])

  return { zoom, setZoom, pan, setPan, zoomIn, zoomOut, zoomReset }
}

// Export all
export default {
  useCanvasInteraction,
  useCanvasZoom,
}