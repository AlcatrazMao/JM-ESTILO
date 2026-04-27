// Save Panel - Design persistence

import { useState, useEffect } from 'react'
import { useDesignStore } from '../../store/designStore'
import { listDesignsLocally } from '../../../../lib/storage'

export function SavePanel() {
  const { saveDesign, loadDesign, deleteDesign } = useDesignStore()
  const [designName, setDesignName] = useState('')
  const [savedDesigns, setSavedDesigns] = useState<string[]>([])

  const refreshList = () => {
    setSavedDesigns(listDesignsLocally())
  }

  const handleSave = () => {
    if (!designName) return
    saveDesign(designName)
    refreshList()
    setDesignName('')
  }

  // Load list on mount
  useEffect(() => {
    refreshList()
  }, [])

  return (
    <div className="w-56 bg-surface border-l border-bg-dim p-3 overflow-y-auto">
      <h3 className="text-xs font-bold text-gold mb-3">MY DESIGNS</h3>
      
      {/* Save current */}
      <div className="mb-4 space-y-2">
        <input
          type="text"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          placeholder="Design name..."
          className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
        />
        <button
          onClick={handleSave}
          disabled={!designName}
          className="w-full py-1.5 bg-gold text-surface font-bold rounded text-xs disabled:opacity-50"
        >
          Save Design
        </button>
      </div>
      
      <div className="w-full h-px bg-bg-dim mb-4" />
      
      {/* Saved list */}
      <div className="space-y-1">
        {savedDesigns.length === 0 ? (
          <p className="text-xs text-text-dim text-center py-4">No saved designs</p>
        ) : (
          savedDesigns.map(name => (
            <div key={name} className="flex items-center justify-between gap-1 group">
              <button
                onClick={() => loadDesign(name)}
                className="flex-1 text-left px-2 py-1 text-xs rounded hover:bg-bg-dim truncate"
              >
                {name}
              </button>
              <button
                onClick={() => {
                  deleteDesign(name)
                  refreshList()
                }}
                className="p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded"
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SavePanel