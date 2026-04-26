// DesignPreview - Live 3D preview of design on garments
// Uses Canvas to render design as texture

import { useMemo } from 'react'
import { useDesignStore } from '../store/designStore'

// Available garments for preview
export const AVAILABLE_GARMENTS = [
  { id: 'tshirt', label: 'Remera' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'crewneck', label: 'Cuello Redondo' },
  { id: 'tote', label: 'Bolso' },
  { id: 'cap', label: 'Gorra' },
] as const

// Available colors
export const GARMENT_COLORS = [
  { value: '#141414', label: 'Negro' },
  { value: '#ffffff', label: 'Blanco' },
  { value: '#1d4ed8', label: 'Azul' },
  { value: '#dc2626', label: 'Rojo' },
  { value: '#16a34a', label: 'Verde' },
  { value: '#f59e0b', label: 'Amarillo' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#ec4899', label: 'Rosa' },
] as const

// Simple preview component with garment/color selectors
export function DesignPreview({
  onGarmentChange,
  onColorChange,
}: {
  onGarmentChange?: (id: string) => void
  onColorChange?: (color: string) => void
}) {
  const nodes = useDesignStore(state => state.nodes)
  
  // Generate design preview image
  const previewSrc = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')!
    
    ctx.clearRect(0, 0, 400, 400)
    
    // White background
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, 400, 400)
    
    // Draw centered design
    const scale = 400 / 1200
    
    for (const nodeId in nodes) {
      const node = nodes[nodeId]
      if (!node.visible || node.type === 'canvas') continue
      
      // Get content as any for flexibility
      const content = node.content as Record<string, unknown> | undefined
      const styles = node.styles as Record<string, unknown> | undefined
      
      if (node.type === 'text' && content?.text) {
        const fontSize = ((styles?.fontSize as number) || 24) * scale * 3
        ctx.font = `${styles?.fontWeight || 400} ${fontSize}px Georgia, serif`
        ctx.fillStyle = String(styles?.color || '#000000')
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const x = 200 + (Number(node.position?.x) || 0) * scale - 200
        const y = 200 + (Number(node.position?.y) || 0) * scale - 200
        ctx.fillText(String(content.text), x, y)
      }
    }
    
    return canvas.toDataURL()
  }, [nodes])
  
  return (
    <div className="flex flex-col h-full">
      {/* Preview thumbnail */}
      <div className="flex-1 flex items-center justify-center bg-bg p-4">
        <div className="w-48 h-48 rounded-lg overflow-hidden shadow-lg bg-white">
          <img src={previewSrc} alt="Preview" className="w-full h-full object-contain" />
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4 bg-surface border-t border-border space-y-4">
        {/* Garment selector */}
        <div>
          <div className="text-xs uppercase tracking-wider text-text-dim mb-2">Prenda</div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GARMENTS.map(g => (
              <button
                key={g.id}
                onClick={() => onGarmentChange?.(g.id)}
                className="px-3 py-1.5 text-xs uppercase bg-bg border border-border hover:border-gold"
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Color selector */}
        <div>
          <div className="text-xs uppercase tracking-wider text-text-dim mb-2">Color</div>
          <div className="flex flex-wrap gap-2">
            {GARMENT_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => onColorChange?.(c.value)}
                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gold"
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to check if design has content
export function useHasDesign(): boolean {
  const nodes = useDesignStore(state => state.nodes)
  return Object.keys(nodes).filter(id => 
    id !== 'design-root' && nodes[id]?.visible
  ).length > 0
}

export default DesignPreview