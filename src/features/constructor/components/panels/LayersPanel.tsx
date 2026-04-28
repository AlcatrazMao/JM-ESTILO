// Layers Panel - Simple layer management for constructor

import { useDesignStore, rootDesignId } from '../../store/designStore'

function getNodeName(node: any) {
  if (node.name) return node.name
  if (node.type === 'text') return (node.content as any)?.text?.slice(0, 15) || 'Text'
  return node.type.toUpperCase()
}

export function LayersPanel() {
  const { nodes, selectedIds, selectOne } = useDesignStore()
  const root = nodes[rootDesignId]
  
  if (!root) return null

  const sortedChildren = [...root.children].reverse()

  return (
    <div className="w-56 bg-surface/80 backdrop-blur-md border-r border-bg-dim/50 p-3 rounded-2xl shadow-xl">
      <h3 className="text-xs font-bold text-text-dim mb-3 uppercase tracking-wider">Layers</h3>
      
      <div className="space-y-1">
        {sortedChildren.map((id: string) => {
          const node = nodes[id]
          if (!node) return null
          
          const isSelected = selectedIds.includes(id)
          
          return (
            <button
              key={id}
              onClick={() => selectOne(id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                isSelected 
                  ? 'bg-gold text-surface font-bold shadow-md' 
                  : 'bg-bg/50 hover:bg-bg-dim text-text'
              }`}
            >
              <span className="opacity-50">{node.type === 'text' ? 'T' : node.type === 'image' ? 'I' : 'D'}</span>
              <span className="flex-1 truncate">{getNodeName(node)}</span>
              {node.visible !== false && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
              )}
            </button>
          )
        })}
      </div>
      
      {sortedChildren.length === 0 && (
        <div className="text-xs text-text-dim text-center py-8 opacity-50">
          No layers yet.<br/>
          Add text or images to start.
        </div>
      )}
    </div>
  )
}

export default LayersPanel