// Zoom Controls - Enhanced zoom with fit/pan

import { useState, useRef, useEffect } from 'react'

interface ZoomControlsProps {
  zoom: number
  onZoomChange: (zoom: number) => void
}

const ZOOM_PRESETS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2]

export function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleZoomIn = () => {
    const idx = ZOOM_PRESETS.findIndex(z => z > zoom)
    if (idx !== -1) {
      onZoomChange(ZOOM_PRESETS[idx])
    } else {
      onZoomChange(Math.min(zoom + 0.25, 2))
    }
  }

  const handleZoomOut = () => {
    // Find the largest zoom preset less than current
    let idx = -1
    for (let i = 0; i < ZOOM_PRESETS.length; i++) {
      if (ZOOM_PRESETS[i] < zoom) {
        idx = i
      }
    }
    if (idx !== -1) {
      onZoomChange(ZOOM_PRESETS[idx])
    } else {
      onZoomChange(Math.max(zoom - 0.25, 0.1))
    }
  }

  const handleFitToScreen = () => {
    onZoomChange(0.4) // Default fit zoom
  }

  const handleZoomTo100 = () => {
    onZoomChange(1)
  }

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="flex items-center gap-1" ref={dropdownRef}>
      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-bg-dim transition-colors"
        title="Zoom Out"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {/* Current zoom */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="min-w-[4rem] h-7 flex items-center justify-center px-2 rounded hover:bg-bg-dim transition-colors text-xs"
        >
          {zoomPercent}%
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-surface border border-bg-dim rounded-lg shadow-lg z-50">
            <div className="p-1">
              {ZOOM_PRESETS.map(z => (
                <button
                  key={z}
                  onClick={() => {
                    onZoomChange(z)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-2 py-1 text-xs rounded ${
                    Math.round(z * 100) === zoomPercent
                      ? 'bg-gold text-surface font-bold'
                      : 'hover:bg-bg-dim'
                  }`}
                >
                  {Math.round(z * 100)}%
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-bg-dim transition-colors"
        title="Zoom In"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Separator */}
      <div className="w-px h-5 bg-bg-dim mx-1" />

      {/* Fit to screen */}
      <button
        onClick={handleFitToScreen}
        className="h-7 px-2 flex items-center justify-center rounded hover:bg-bg-dim transition-colors text-xs"
        title="Fit to Screen"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5 5m11 1l-5 5m0 0h4m-4 0l5-5" />
        </svg>
      </button>

      {/* 100% */}
      <button
        onClick={handleZoomTo100}
        className="h-7 px-2 flex items-center justify-center rounded hover:bg-bg-dim transition-colors text-xs"
        title="Actual Size (100%)"
      >
        1:1
      </button>

      {/* Separator */}
      <div className="w-px h-5 bg-bg-dim mx-1" />

      {/* Pan mode toggle */}
      <button
        onClick={() => onZoomChange(zoom === 0.4 ? 1 : 0.4)}
        className={`h-7 px-2 flex items-center justify-center rounded transition-colors text-xs ${
          zoom === 0.4 ? 'bg-gold text-surface' : 'hover:bg-bg-dim'
        }`}
        title="Toggle Pan Mode"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.63l-2.122-2.122" />
        </svg>
      </button>
    </div>
  )
}

export default ZoomControls