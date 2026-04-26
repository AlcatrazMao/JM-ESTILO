// Export Panel - Select profile and export design

import { useState, useCallback } from 'react'
import { EXPORT_PROFILES, ExportProfile, exportDesign } from '../lib/exportProfiles'

interface ExportPanelProps {
  design: {
    nodes: Record<string, any>
    canvas: { width: number; height: number; background: string }
  }
  onExportComplete: (url: string, profileId: string) => void
  onCancel: () => void
}

export function ExportPanel({ design, onExportComplete, onCancel }: ExportPanelProps) {
  const [selectedProfile, setSelectedProfile] = useState(EXPORT_PROFILES[0].id)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    setError(null)
    
    try {
      const url = await exportDesign(design, selectedProfile)
      onExportComplete(url, selectedProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }, [design, selectedProfile, onExportComplete])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg w-[90vw] max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center px-4 justify-between">
          <h2 className="text-sm uppercase tracking-wider">Export Design</h2>
          <button onClick={onCancel} className="text-text-dim hover:text-text">✕</button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm">{error}</div>
          )}
          
          <div className="mb-4">
            <label className="text-xs uppercase tracking-wider text-text-dim block mb-2">
              Select Print Profile
            </label>
            
            <div className="space-y-2">
              {EXPORT_PROFILES.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile.id)}
                  className={`w-full p-3 text-left border rounded transition-colors ${
                    selectedProfile === profile.id
                      ? 'border-gold bg-gold/10'
                      : 'border-border hover:border-gold'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{profile.name}</span>
                    <span className="text-xs text-text-dim uppercase">
                      {profile.format.toUpperCase()} @ {profile.dpi} DPI
                    </span>
                  </div>
                  <div className="text-xs text-text-dim mt-1">{profile.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Profile details */}
          {(() => {
            const profile = EXPORT_PROFILES.find(p => p.id === selectedProfile)
            if (!profile) return null
            
            return (
              <div className="p-3 bg-bg rounded text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-dim">Format</span>
                  <span>{profile.format.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-dim">Resolution</span>
                  <span>{profile.dpi} DPI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-dim">Color Mode</span>
                  <span>{profile.colorMode.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-dim">Max Size</span>
                  <span>{profile.maxWidthCm} × {profile.maxHeightCm} cm</span>
                </div>
                {(profile.includeWhiteBase || profile.mirrorForTransfer) && (
                  <div className="text-gold mt-2 pt-2 border-t border-border">
                    {profile.includeWhiteBase && <div>• Includes white base layer</div>}
                    {profile.mirrorForTransfer && <div>• Mirrored for transfer</div>}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
        
        {/* Footer */}
        <div className="h-14 border-t border-border flex items-center justify-end px-4 gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs uppercase text-text-dim"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-gold text-[#0a0808] text-xs uppercase disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportPanel