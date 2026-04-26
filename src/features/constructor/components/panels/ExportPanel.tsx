// Export Panel - Multi-format export for print

import { useState } from 'react'
import { useDesignStore, DesignNode } from '../../store/designStore'

interface ExportProfile {
  id: string
  name: string
  description: string
  format: 'png' | 'jpg' | 'pdf' | 'svg'
  dpi: number
  scale: number
}

const EXPORT_PROFILES: ExportProfile[] = [
  { id: 'dtf', name: 'DTF', description: 'Direct to Film', format: 'png', dpi: 300, scale: 1 },
  { id: 'dtg', name: 'DTG', description: 'Direct to Garment', format: 'png', dpi: 300, scale: 1 },
  { id: 'serigrafia', name: 'Serigrafía', description: 'Screen Print', format: 'png', dpi: 300, scale: 1 },
  { id: 'sublimacion', name: 'Sublimación', description: 'Sublimation', format: 'jpg', dpi: 300, scale: 1 },
  { id: 'vinyl', name: 'Vinyl', description: 'Vinyl Cut', format: 'svg', dpi: 300, scale: 1 },
  { id: 'preview', name: 'Preview', description: 'Web Preview', format: 'png', dpi: 72, scale: 0.5 },
]

export function ExportPanel() {
  const { nodes, canvasSize, canvasBackground } = useDesignStore()
  const [isExporting, setIsExporting] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<string>('dtf')

  const handleExport = async (profileId: string) => {
    setIsExporting(true)
    
    try {
      const profile = EXPORT_PROFILES.find(p => p.id === profileId)
      if (!profile) return

      // Create canvas for export
      const canvas = document.createElement('canvas')
      const scale = profile.scale
      canvas.width = canvasSize.w * scale
      canvas.height = canvasSize.h * scale
      
      const ctx = canvas.getContext('2d')!
      
      // Background
      ctx.fillStyle = canvasBackground || '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw each node
      const root = nodes['design-root']
      if (root) {
        for (const nodeId of root.children) {
          const node = nodes[nodeId]
          if (!node || node.visible === false) continue
          
          const x = node.position.x * scale
          const y = node.position.y * scale
          const w = node.size.w * scale
          const h = node.size.h * scale
          
          // Background
          if (node.styles?.background && node.styles.background !== 'transparent') {
            ctx.fillStyle = node.styles.background as string
            roundRect(ctx, x, y, w, h, (node.styles.borderRadius as number || 0) * scale)
            ctx.fill()
          }
          
          // Text
          const textContent = getTextContent(node)
          if (node.type === 'text' && textContent) {
            const fontSize = (node.styles?.fontSize as number || 24) * scale
            ctx.font = `${node.styles?.fontWeight || 400} ${fontSize}px sans-serif`
            ctx.fillStyle = (node.styles?.color as string) || '#000000'
            ctx.textBaseline = 'top'
            ctx.fillText(textContent, x + (node.styles?.padding ? (node.styles.padding as number) * scale : 0), y + (node.styles?.padding ? (node.styles.padding as number) * scale : 0))
          }
          
          // Image
          const imageSrc = getImageSrc(node)
          if (node.type === 'image' && imageSrc) {
            try {
              const img = await loadImage(imageSrc)
              const objectFit = node.styles?.objectFit || 'contain'
              
              ctx.save()
              ctx.beginPath()
              roundRect(ctx, x, y, w, h, (node.styles?.borderRadius as number || 0) * scale)
              ctx.clip()
              
              const imgRatio = img.width / img.height
              const nodeRatio = w / h
              let sx = x, sy = y, sw = w, sh = h
              
              if (objectFit === 'cover') {
                if (imgRatio > nodeRatio) {
                  sw = w
                  sh = w / imgRatio
                  sy = y + (h - sh) / 2
                } else {
                  sh = h
                  sw = h * imgRatio
                  sx = x + (w - sw) / 2
                }
              }
              
              ctx.drawImage(img, sx, sy, sw, sh)
              ctx.restore()
            } catch (e) {
              console.error('Failed to load image:', imageSrc)
            }
          }
        }
      }
      
      // Export
      const mimeType = profile.format === 'jpg' ? 'image/jpeg' : 'image/png'
      const dataUrl = canvas.toDataURL(mimeType, 0.95)
      
      // Download
      const link = document.createElement('a')
      link.download = `jm-estilo-${profileId}-${Date.now()}.${profile.format}`
      link.href = dataUrl
      link.click()
      
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const activeProfile = EXPORT_PROFILES.find(p => p.id === selectedProfile)

  return (
    <div className="w-56 bg-surface border-l border-bg-dim p-3">
      <h3 className="text-xs font-bold text-gold mb-3">EXPORT</h3>
      
      {/* Profile selection */}
      <div className="mb-4">
        <label className="text-xs text-text-dim block mb-2">Profile</label>
        <div className="space-y-1">
          {EXPORT_PROFILES.map(profile => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile.id)}
              className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                selectedProfile === profile.id 
                  ? 'bg-gold text-surface font-bold' 
                  : 'bg-bg hover:bg-bg-dim'
              }`}
            >
              {profile.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Profile info */}
      {activeProfile && (
        <div className="mb-4 p-3 bg-bg rounded">
          <p className="text-xs font-bold">{activeProfile.name}</p>
          <p className="text-xs text-text-dim">{activeProfile.description}</p>
          <p className="text-xs text-text-dim mt-1">
            {activeProfile.format.toUpperCase()} • {activeProfile.dpi} DPI
          </p>
        </div>
      )}
      
      {/* Export button */}
      <button
        onClick={() => handleExport(selectedProfile)}
        disabled={isExporting}
        className="w-full py-3 bg-gold hover:bg-gold/80 text-surface font-bold rounded transition-colors disabled:opacity-50"
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
    </div>
  )
}

// Helper: round rect
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Helper: load image
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Helper: get text content safely
function getTextContent(node: DesignNode): string {
  const content = node.content as any
  return content?.text || ''
}

// Helper: get image src safely
function getImageSrc(node: DesignNode): string {
  const content = node.content as any
  return content?.src || ''
}

export default ExportPanel