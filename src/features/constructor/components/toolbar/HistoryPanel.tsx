// History Panel - Undo/Redo UI

import { useDesignStore } from '../../store/designStore'

export function HistoryPanel() {
  const { history, historyIndex, undo, redo } = useDesignStore()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="flex items-center gap-1">
      {/* Undo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
        </svg>
      </button>

      {/* Redo */}
      <button
        onClick={redo}
        disabled={!canRedo}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-dim transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
        </svg>
      </button>

      {/* History indicator */}
      <span className="text-xs text-text-dim px-2">
        {historyIndex + 1}/{history.length}
      </span>

      {/* History dropdown */}
      {history.length > 1 && (
        <div className="relative group">
          <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-dim transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {/* History dropdown */}
          <div className="absolute top-full right-0 mt-1 w-48 bg-surface border border-bg-dim rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              {history.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const diff = idx - historyIndex
                    if (diff < 0) {
                      for (let i = 0; i < -diff; i++) undo()
                    } else {
                      for (let i = 0; i < diff; i++) redo()
                    }
                  }}
                  className={`w-full text-left px-2 py-1 text-xs rounded ${
                    idx === historyIndex 
                      ? 'bg-gold text-surface font-bold' 
                      : 'hover:bg-bg-dim'
                  }`}
                >
                  {idx === 0 ? 'Initial' : `Step ${idx}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPanel