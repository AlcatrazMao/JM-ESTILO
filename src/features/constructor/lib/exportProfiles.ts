// Export Profiles - Print production standards
// Based on researched specifications for DTF, DTG, Serigrafía, Sublimación

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage, auth } from '../../../lib/firebase'
import { getIdToken } from '../../../lib/firebase'

// ─── Profile Definitions ──────────────────────────────────────────────────────────────

export interface ExportProfile {
  id: string
  name: string
  description: string
  
  // Image specs
  format: 'png' | 'jpg' | 'tiff' | 'pdf' | 'svg'
  dpi: number
  colorMode: 'srgb' | 'cmyk' | 'pantone'
  
  // Canvas settings
  maxWidthCm: number
  maxHeightCm: number
  background: 'transparent' | 'white'
  
  // Special handling
  includeWhiteBase?: boolean  // For DTF
  mirrorForTransfer?: boolean  // For DTF/Sublimation
}

export const EXPORT_PROFILES: ExportProfile[] = [
  {
    id: 'dtf',
    name: 'DTF',
    description: 'Direct To Film -Transfer to garment with hot press',
    format: 'png',
    dpi: 300,
    colorMode: 'srgb',
    maxWidthCm: 55,
    maxHeightCm: 100,
    background: 'transparent',
    includeWhiteBase: true,
    mirrorForTransfer: true,
  },
  {
    id: 'dtg',
    name: 'DTG',
    description: 'Direct To Garment - Direct inkjet printing',
    format: 'png',
    dpi: 300,
    colorMode: 'srgb',
    maxWidthCm: 40,
    maxHeightCm: 50,
    background: 'transparent',
  },
  {
    id: 'serigrafia',
    name: 'Serigrafía',
    description: 'Screen printing - Vector preferred',
    format: 'pdf',
    dpi: 300,  // Will be vector in production
    colorMode: 'pantone',
    maxWidthCm: 50,
    maxHeightCm: 70,
    background: 'transparent',
  },
  {
    id: 'sublimacion',
    name: 'Sublimación',
    description: 'Heat transfer on polyester',
    format: 'png',
    dpi: 300,
    colorMode: 'srgb',
    maxWidthCm: 60,
    maxHeightCm: 100,
    background: 'white',
    mirrorForTransfer: true,
  },
  {
    id: 'vinilo',
    name: 'Vinilo',
    description: 'Vinyl cut - Simple shapes only',
    format: 'svg',
    dpi: 0,  // Vector
    colorMode: 'pantone',
    maxWidthCm: 50,
    maxHeightCm: 60,
    background: 'transparent',
  },
]

// ─── Export Service ──────────────────────────────────────────────────────────────

interface DesignData {
  nodes: Record<string, any>
  canvas: { width: number; height: number; background: string }
}

// Canvas to PNG at specified DPI
async function canvasToPng(
  canvasOrImage: HTMLCanvasElement | HTMLImageElement,
  options: {
    dpi: number
    background: 'transparent' | 'white'
    x?: number
    y?: number
    w?: number
    h?: number
  }
): Promise<Blob> {
  const { dpi, background, x = 0, y = 0, w, h } = options
  
  // For now, if it's an image, draw to canvas
  let sourceCanvas: HTMLCanvasElement
  
  if (canvasOrImage instanceof HTMLCanvasElement) {
    sourceCanvas = canvasOrImage
  } else {
    sourceCanvas = document.createElement('canvas')
    sourceCanvas.width = canvasOrImage.width
    sourceCanvas.height = canvasOrImage.height
    const ctx = sourceCanvas.getContext('2d')!
    ctx.drawImage(canvasOrImage, 0, 0)
  }
  
  // Calculate dimensions at target DPI (assuming source is at 72 DPI)
  // 300 DPI = 118.11 pixels per cm
  const pxPerCm = dpi / 2.54
  const targetX = Math.round(x * pxPerCm / 72 * 96) // Convert from 72 DPI assumption
  const targetY = Math.round(y * pxPerCm / 72 * 96)
  const targetW = w ? Math.round(w * pxPerCm / 72 * 96) : sourceCanvas.width
  const targetH = h ? Math.round(h * pxPerCm / 72 * 96) : sourceCanvas.height
  
  // Create output canvas at target size
  const output = document.createElement('canvas')
  output.width = targetW
  output.height = targetH
  const ctx = output.getContext('2d')!
  
  // Fill background if needed
  if (background === 'white') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, targetW, targetH)
  }
  
  // Draw scaled
  ctx.drawImage(sourceCanvas, x, y, w || sourceCanvas.width, h || sourceCanvas.height, 0, 0, targetW, targetH)
  
  return new Promise((resolve, reject) => {
    output.toBlob(b => {
      if (b) resolve(b)
      else reject(new Error('Export failed'))
    }, 'image/png', 0.95)
  })
}

// Export design to profile
export async function exportDesign(
  design: DesignData,
  profileId: string,
  options?: {
    includeWhiteBase?: boolean
    mirrorHorizontal?: boolean
  }
): Promise<string> {
  const profile = EXPORT_PROFILES.find(p => p.id === profileId)
  if (!profile) throw new Error(`Unknown profile: ${profileId}`)
  
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  
  // For now, create a simple canvas from design nodes
  // In full implementation, this would composite all nodes
  const canvasWidth = Math.min(design.canvas.width, Math.round(profile.maxWidthCm * profile.dpi / 2.54))
  const canvasHeight = Math.min(design.canvas.height, Math.round(profile.maxHeightCm * profile.dpi / 2.54))
  
  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')!
  
  // Fill background
  if (profile.background === 'white') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }
  
  // Draw each node (simplified for now - only draws images)
  for (const nodeId in design.nodes) {
    const node = design.nodes[nodeId]
    if (node.type !== 'image' || !node.content?.src) continue
    
    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = node.content.src
      })
      
      if (node.content.src) {
        ctx.drawImage(
          img,
          node.position.x,
          node.position.y,
          node.size.w,
          node.size.h
        )
      }
    } catch (e) {
      console.warn('Failed to draw image:', node.content.src, e)
    }
  }
  
  // Apply white base if needed (for DTF)
  let finalCanvas = canvas
  if (profile.includeWhiteBase || options?.includeWhiteBase) {
    finalCanvas = document.createElement('canvas')
    finalCanvas.width = canvas.width
    finalCanvas.height = canvas.height
    const fctx = finalCanvas.getContext('2d')!
    fctx.fillStyle = '#ffffff'
    fctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)
    fctx.drawImage(canvas, 0, 0)
  }
  
  // Mirror if needed
  if (profile.mirrorForTransfer || options?.mirrorHorizontal) {
    const mirrored = document.createElement('canvas')
    mirrored.width = finalCanvas.width
    mirrored.height = finalCanvas.height
    const mctx = mirrored.getContext('2d')!
    mctx.translate(mirrored.width, 0)
    mctx.scale(-1, 1)
    mctx.drawImage(finalCanvas, 0, 0)
    finalCanvas = mirrored
  }
  
  // Export to blob
  const blob = await canvasToPng(finalCanvas, {
    dpi: profile.dpi,
    background: profile.background,
  })
  
  // Upload to Firebase
  const storageRef = ref(storage, `exports/${user.uid}/${Date.now()}-${profileId}.${profile.format}`)
  await uploadBytes(storageRef, blob)
  const url = await getDownloadURL(storageRef)
  
  return url
}

// Get profile by ID
export function getProfile(id: string): ExportProfile | undefined {
  return EXPORT_PROFILES.find(p => p.id === id)
}