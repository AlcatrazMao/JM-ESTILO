// Responsive Preview - Preview design on different devices

import { useState } from 'react'
import { useDesignStore, rootDesignId } from '../store/designStore'

type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'watch'

interface DevicePreset {
  id: DeviceType
  name: string
  width: number
  height: number
  icon: string
}

const DEVICE_PRESETS: DevicePreset[] = [
  { id: 'desktop', name: 'Desktop', width: 1920, height: 1080, icon: '🖥️' },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: '📱' },
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: '📱' },
  { id: 'watch', name: 'Watch', width: 184, height: 224, icon: '⌚' },
]

export function ResponsivePreview() {
  const { nodes, selectedIds, canvasSize } = useDesignStore()
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop')
  const [showGrid, setShowGrid] = useState(true)

  const root = nodes[rootDesignId]
  if (!root) return null

  // Calculate scale to fit preview container
  const device = DEVICE_PRESETS.find(d => d.id === selectedDevice) || DEVICE_PRESETS[0]
  const previewScale = Math.min(
    (device.width - 40) / canvasSize.w,
    (device.height - 40) / canvasSize.h,
    1
  )

  return (
    <div className="flex-1 flex flex-col bg-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-surface border-b border-bg-dim">
        <div className="flex items-center gap-1">
          {DEVICE_PRESETS.map(device => (
            <button
              key={device.id}
              onClick={() => setSelectedDevice(device.id)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                selectedDevice === device.id
                  ? 'bg-gold text-surface font-bold'
                  : 'bg-bg hover:bg-bg-dim'
              }`}
              title={device.name}
            >
              <span className="mr-1">{device.icon}</span>
              {device.name}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="accent-gold"
          />
          <span>Grid</span>
        </label>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div 
          className="relative bg-surface shadow-lg"
          style={{
            width: device.width,
            height: device.height,
            transform: `scale(${previewScale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Device frame */}
          <div 
            className="absolute inset-0 border-2 border-gray-300 rounded"
            style={{
              borderWidth: selectedDevice !== 'desktop' ? '8' : '0',
              borderRadius: selectedDevice === 'mobile' ? '24px' : selectedDevice === 'tablet' ? '12px' : '4px',
            }}
          >
            {/* Screen */}
            <div
              className="absolute inset-0 bg-white overflow-hidden"
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              {/* Canvas preview */}
              <div
                className="relative"
                style={{
                  width: canvasSize.w,
                  height: canvasSize.h,
                  backgroundColor: '#ffffff',
                  backgroundImage: showGrid 
                    ? 'radial-gradient(circle, #ddd 1px, transparent 1px)' 
                    : 'none',
                  backgroundSize: showGrid ? '20px 20px' : 'auto',
                }}
              >
                {root.children.map((id: string) => {
                  const node = nodes[id]
                  if (!node || node.visible === false) return null

                  const bgColor = node.styles?.background as string || 'transparent'
                  const textColor = node.styles?.color as string || '#000000'
                  const fontSize = node.styles?.fontSize as number || 16
                  const padding = node.styles?.padding ? Number(node.styles.padding) : 0

                  const isSelected = selectedIds.includes(id)

                  return (
                    <div
                      key={id}
                      className={`absolute ${isSelected ? 'ring-2 ring-gold' : ''}`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        width: node.size.w,
                        height: node.size.h,
                        backgroundColor: bgColor,
                        borderRadius: node.styles?.borderRadius ? Number(node.styles.borderRadius) : 0,
                        padding: padding,
                        fontSize: fontSize,
                        color: textColor,
                        fontWeight: node.styles?.fontWeight || 400,
                        textAlign: (node.styles?.textAlign as any) || 'left',
                      }}
                    >
                      {node.type === 'text' && (node.content as any)?.text}
                      {node.type === 'image' && (node.content as any)?.src && (
                        <img 
                          src={(node.content as any).src} 
                          alt={(node.content as any).alt || ''}
                          className="w-full h-full object-contain"
                          style={{
                            objectFit: (node.styles?.objectFit as any) || 'contain',
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Device info */}
            <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-text-dim">
              {device.width} × {device.height}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResponsivePreview