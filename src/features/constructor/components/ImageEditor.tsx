// Image Editor - Upload, crop, resize for print designs
// Uses native Canvas API - no heavy libraries

import { useState, useRef, useCallback, useEffect } from 'react'

interface ImageEditorProps {
  imageUrl?: string
  onSave: (url: string, width: number, height: number) => void
  onCancel: () => void
  // Print size in cm (will be converted to pixels at 300 DPI)
  targetWidthCm?: number
  targetHeightCm?: number
}

const DPI = 300
const CM_TO_INCH = 2.54

export function ImageEditor({
  imageUrl,
  onSave,
  onCancel,
  targetWidthCm = 30,
  targetHeightCm = 40,
}: ImageEditorProps) {
  const [src, setSrc] = useState(imageUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 })
  
  // Canvas refs
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  const croppedCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load image when src changes
  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => {
      setImageSize({ w: img.width, h: img.height })
      // Initialize crop to full image
      setCrop({ x: 0, y: 0, w: img.width, h: img.height })
    }
    img.src = src
  }, [src])

  // Draw original + crop preview
  useEffect(() => {
    if (!src || !originalCanvasRef.current) return
    const ctx = originalCanvasRef.current.getContext('2d')
    if (!ctx) return
    
    const img = new Image()
    img.onload = () => {
      originalCanvasRef.current!.width = img.width
      originalCanvasRef.current!.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // Draw crop overlay
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, img.width, img.height)
      ctx.clearRect(crop.x, crop.y, crop.w, crop.h)
      ctx.strokeStyle = '#c9a84c'
      ctx.lineWidth = 4
      ctx.strokeRect(crop.x, crop.y, crop.w, crop.h)
    }
    img.src = src
  }, [src, crop])

  // Update cropped preview
  useEffect(() => {
    if (!src || !croppedCanvasRef.current || crop.w === 0) return
    const ctx = croppedCanvasRef.current.getContext('2d')
    if (!ctx) return
    
    const img = new Image()
    img.onload = () => {
      croppedCanvasRef.current!.width = crop.w
      croppedCanvasRef.current!.height = crop.h
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h)
    }
    img.src = src
  }, [src, crop])

  // Handle file upload
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    // Use base64 instead of Firebase Storage (free tier)
    const reader = new FileReader()
    reader.onload = () => {
      setSrc(reader.result as string)
      setIsUploading(false)
    }
    reader.onerror = () => {
      setError('Failed to read file')
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }, [])

  // Handle crop adjustment
  const handleCropChange = useCallback((axis: 'x' | 'y' | 'w' | 'h', value: number) => {
    setCrop(prev => {
      const next = { ...prev, [axis]: Math.max(0, value) }
      // Constrain to image bounds
      if (next.x + next.w > imageSize.w) next.w = imageSize.w - next.x
      if (next.y + next.h > imageSize.h) next.h = imageSize.h - next.y
      return next
    })
  }, [imageSize])

  // Fit to print area
  const handleFitToPrint = useCallback(() => {
    const targetW = Math.round(targetWidthCm * CM_TO_INCH * DPI)
    const targetH = Math.round(targetHeightCm * CM_TO_INCH * DPI)
    
    // Calculate fit (maintain aspect ratio, fit within target)
    const scale = Math.min(targetW / imageSize.w, targetH / imageSize.h, 1)
    const newW = Math.round(imageSize.w * scale)
    const newH = Math.round(imageSize.h * scale)
    
    // Center crop
    setCrop({
      x: Math.round((imageSize.w - newW) / 2),
      y: Math.round((imageSize.h - newH) / 2),
      w: newW,
      h: newH,
    })
  }, [imageSize, targetWidthCm, targetHeightCm])

  // Export cropped image at 300 DPI
  const handleExport = useCallback(async () => {
    if (!croppedCanvasRef.current || crop.w === 0) return
    
    setIsUploading(true)
    setError(null)
    
    try {
      // Get cropped canvas
      const canvas = croppedCanvasRef.current
      
      // Return as base64 data URL
      const dataUrl = canvas.toDataURL('image/png')
      
      // Return at 300 DPI (pixels)
      onSave(dataUrl, crop.w, crop.h)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsUploading(false)
    }
  }, [crop, onSave])

  // Render
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center px-4 justify-between">
          <h2 className="text-sm uppercase tracking-wider">Edit Image</h2>
          <button onClick={onCancel} className="text-text-dim hover:text-text">✕</button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm">{error}</div>
          )}
          
          {!src ? (
            <div className="text-center py-12">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-3 bg-gold text-[#0a0808] uppercase tracking-wider disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Select Image'}
              </button>
              <p className="mt-4 text-text-dim text-xs">
                PNG, JPG, WebP • Max 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Original + crop preview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase text-text-dim mb-2">Original</div>
                  <div className="bg-bg rounded overflow-auto max-h-64">
                    <canvas ref={originalCanvasRef} className="max-w-full" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-text-dim mb-2">
                    Cropped ({crop.w} × {crop.h} px @ 300 DPI)
                  </div>
                  <div className="bg-bg rounded overflow-auto max-h-64">
                    <canvas ref={croppedCanvasRef} className="max-w-full" />
                  </div>
                </div>
              </div>
              
              {/* Crop controls */}
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-text-dim block mb-1">X</label>
                  <input
                    type="number"
                    value={crop.x}
                    onChange={e => handleCropChange('x', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-bg border border-border"
                  />
                </div>
                <div>
                  <label className="text-text-dim block mb-1">Y</label>
                  <input
                    type="number"
                    value={crop.y}
                    onChange={e => handleCropChange('y', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-bg border border-border"
                  />
                </div>
                <div>
                  <label className="text-text-dim block mb-1">Width</label>
                  <input
                    type="number"
                    value={crop.w}
                    onChange={e => handleCropChange('w', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-bg border border-border"
                  />
                </div>
                <div>
                  <label className="text-text-dim block mb-1">Height</label>
                  <input
                    type="number"
                    value={crop.h}
                    onChange={e => handleCropChange('h', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-bg border border-border"
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleFitToPrint}
                  className="px-4 py-2 bg-bg border border-border text-xs uppercase"
                >
                  Fit to Print ({targetWidthCm}×{targetHeightCm}cm)
                </button>
                <button
                  onClick={() => setSrc('')}
                  className="px-4 py-2 bg-bg border border-border text-xs uppercase"
                >
                  Change Image
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {src && (
          <div className="h-14 border-t border-border flex items-center justify-end px-4 gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs uppercase text-text-dim"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isUploading || crop.w === 0}
              className="px-4 py-2 bg-gold text-[#0a0808] text-xs uppercase disabled:opacity-50"
            >
              {isUploading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageEditor