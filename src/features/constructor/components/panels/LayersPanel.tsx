// Layers Panel - Simple layer management for constructor

import { useDesignStore, rootDesignId } from '../../store/designStore'

export function LayersPanel() {
  const { nodes, selectedIds, selectOne } = useDesignStore()
  const root = nodes[rootDesignId]
  
  if (!root) return null

  const getNodeName = (node: any) => {
    if (node.type === 'text') return node.content?.text?.slice(0, 20) || 'Text'
    if (node.type === 'image') return 'Image'
    if (node.type === 'div') return node.name || 'Group'
    return node.type
  }

  // Sort children so top-most is first in list (reverse of render order)
  const sortedChildren = [...root.children].reverse()

  return (
    <div className="w-48 bg-surface border-r border-border flex flex-col">
      <div className="h-10 px-3 flex items-center border-b border-border">
        <span className="text-xs uppercase tracking-wider text-text-dim">Layers</span>
      </div>
      
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {sortedChildren.map((id: string) => {
          const node = nodes[id]
          if (!node || node.visible === false) return null
          
          const isSelected = selectedIds.includes(id)
          
          return (
            <button
              key={id}
              onClick={() => selectOne(id)}
              className={`w-full px-2 py-1.5 text-left text-xs rounded flex items-center gap-2 transition-colors ${
                isSelected 
                  ? 'bg-gold/20 text-gold' 
                  : 'hover:bg-bg'
              }`}
            >
              {/* Type icon */}
              <span className="w-5 text-center">
                {node.type === 'text' && 'Aa'}
                {node.type === 'image' && '🖼'}
                {node.type === 'div' && '□'}
              </span>
              
              {/* Name */}
              <span className="flex-1 truncate">
                {getNodeName(node)}
              </span>
              
              {/* Visibility indicator */}
              {(node.visible === undefined || node.visible === true) ? (
                <span className="w-2 h-2 rounded-full bg-gold/50" />
              ) : null}
            </button>
          )
        })}
        
        {sortedChildren.length === 0 && (
          <div className="text-xs text-text-dim text-center py-4">
            No layers yet.<br/>
            Add text or images to start.
          </div>
        )}
      </div>
    </div>
  )
}

export default LayersPanel