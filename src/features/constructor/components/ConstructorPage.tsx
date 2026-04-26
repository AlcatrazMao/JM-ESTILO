// Constructor Page - Heavy module, lazy loaded
// This module imports: Three.js, editor libraries, zustand

import { useState, useCallback } from 'react'

interface ConstructorPageProps {
  onSaved?: () => void
}

// Minimal placeholder - will be expanded with full editor
export function ConstructorPage({ onSaved }: ConstructorPageProps) {
  const [loading, setLoading] = useState(true)

  // TODO: Integrate freeBuilderStore from PROYECTO_TIENDA
  // TODO: Add image editor (upload, crop, resize)
  // TODO: Integrate Viewer3D for live preview
  // TODO: Add export profiles (DTF, Serigrafía, etc.)

  const handleSave = useCallback(() => {
    // Save design to Firebase + D1
    console.log('Saving design...')
    onSaved?.()
  }, [onSaved])

  return (
    <div className="flex-1 flex flex-col bg-surface">
      {/* Header */}
      <div className="h-[48px] bg-surface border-b border-border flex items-center px-4 gap-4">
        <h1 className="text-sm tracking-wider uppercase">Editor de Diseño</h1>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          className="px-4 py-1.5 bg-gold text-[#0a0808] text-xs uppercase tracking-wider"
        >
          Guardar
        </button>
      </div>

      {/* Work in progress */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-dim text-sm mb-2">Constructor en construcción</p>
          <p className="text-text-dim text-xs">Coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default ConstructorPage