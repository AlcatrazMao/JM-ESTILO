// Properties Panel - Edit selected node properties

import { useDesignStore, rootDesignId } from '../../store/designStore'

export function PropertiesPanel() {
  const { nodes, selectedIds, patchNode, updateContent } = useDesignStore()

  const selectedIdsWithoutRoot = selectedIds.filter(id => id !== rootDesignId)
  const selectedId = selectedIdsWithoutRoot[0]
  const node = selectedId ? nodes[selectedId] : null

  if (!node) {
    return (
      <div className="w-56 bg-surface border-l border-bg-dim p-3">
        <h3 className="text-xs font-bold text-text-dim mb-2">PROPERTIES</h3>
        <p className="text-xs text-text-dim">Select an element to edit its properties</p>
      </div>
    )
  }

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    patchNode(node.id, {
      position: { ...node.position, [axis]: value }
    })
  }

  const handleSizeChange = (dim: 'w' | 'h', value: number) => {
    patchNode(node.id, {
      size: { ...node.size, [dim]: value }
    })
  }

  const handleStyleChange = (style: string, value: string | number) => {
    patchNode(node.id, {
      styles: { ...node.styles, [style]: value }
    })
  }

  const handleContentChange = (content: any) => {
    updateContent(node.id, content)
  }

  return (
    <div className="w-56 bg-surface border-l border-bg-dim p-3 overflow-y-auto">
      <h3 className="text-xs font-bold text-gold mb-3">{node.name}</h3>

      {/* Position */}
      <div className="mb-4">
        <label className="text-xs text-text-dim block mb-1">Position</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <span className="text-xs text-text-dim">X</span>
            <input
              type="number"
              value={node.position.x}
              onChange={(e) => handlePositionChange('x', Number(e.target.value))}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs text-text-dim">Y</span>
            <input
              type="number"
              value={node.position.y}
              onChange={(e) => handlePositionChange('y', Number(e.target.value))}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div className="mb-4">
        <label className="text-xs text-text-dim block mb-1">Size</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <span className="text-xs text-text-dim">W</span>
            <input
              type="number"
              value={node.size.w}
              onChange={(e) => handleSizeChange('w', Number(e.target.value))}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
            />
          </div>
          <div className="flex-1">
            <span className="text-xs text-text-dim">H</span>
            <input
              type="number"
              value={node.size.h}
              onChange={(e) => handleSizeChange('h', Number(e.target.value))}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Styles */}
      {node.type === 'text' && (
        <>
          {/* Text Content */}
          <div className="mb-4">
            <label className="text-xs text-text-dim block mb-1">Text</label>
            <textarea
              value={(node.content as any)?.text || ''}
              onChange={(e) => handleContentChange({ text: e.target.value })}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs h-20 resize-none"
            />
          </div>

          {/* Font Size */}
          <div className="mb-4">
            <label className="text-xs text-text-dim block mb-1">Font Size</label>
            <input
              type="number"
              value={(node.styles as any)?.fontSize || 24}
              onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
            />
          </div>

          {/* Color */}
          <div className="mb-4">
            <label className="text-xs text-text-dim block mb-1">Text Color</label>
            <input
              type="color"
              value={(node.styles as any)?.color || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-full h-8 bg-bg border border-bg-dim rounded cursor-pointer"
            />
          </div>

          {/* Font Weight */}
          <div className="mb-4">
            <label className="text-xs text-text-dim block mb-1">Font Weight</label>
            <select
              value={(node.styles as any)?.fontWeight || 400}
              onChange={(e) => handleStyleChange('fontWeight', Number(e.target.value))}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
            >
              <option value={400}>Normal</option>
              <option value={500}>Medium</option>
              <option value={600}>Semi Bold</option>
              <option value={700}>Bold</option>
            </select>
          </div>
        </>
      )}

      {node.type === 'image' && (
        <>
          {/* Image URL */}
          <div className="mb-4">
            <label className="text-xs text-text-dim block mb-1">Image URL</label>
            <input
              type="text"
              value={(node.content as any)?.src || ''}
              onChange={(e) => handleContentChange({ src: e.target.value, alt: (node.content as any)?.alt || '' })}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
              placeholder="https://..."
            />
          </div>

          {/* Object Fit */}
          <div className="mb-4">
            <label className="text-xs text-text-dim block mb-1">Object Fit</label>
            <select
              value={(node.styles as any)?.objectFit || 'contain'}
              onChange={(e) => handleStyleChange('objectFit', e.target.value)}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
            </select>
          </div>

          {/* Border Radius */}
          <div className="mb-4">
            <label className="text-xs text-text-dim block mb-1">Border Radius</label>
            <input
              type="number"
              value={(node.styles as any)?.borderRadius || 0}
              onChange={(e) => handleStyleChange('borderRadius', Number(e.target.value))}
              className="w-full bg-bg border border-bg-dim rounded px-2 py-1 text-xs"
            />
          </div>
        </>
      )}

      {/* Common styles */}
      <div className="mb-4">
        <label className="text-xs text-text-dim block mb-1">Background</label>
        <input
          type="color"
          value={(node.styles as any)?.background || '#ffffff'}
          onChange={(e) => handleStyleChange('background', e.target.value)}
          className="w-full h-8 bg-bg border border-bg-dim rounded cursor-pointer"
        />
      </div>

      {/* Visibility */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={node.visible !== false}
            onChange={(e) => patchNode(node.id, { visible: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-xs">Visible</span>
        </label>
      </div>

      {/* Lock */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={node.locked || false}
            onChange={(e) => patchNode(node.id, { locked: e.target.checked })}
            className="accent-gold"
          />
          <span className="text-xs">Locked</span>
        </label>
      </div>

      {/* Node ID (debug) */}
      <div className="mt-8 pt-3 border-t border-bg-dim">
        <p className="text-xs text-text-dim break-all">{node.id}</p>
      </div>
    </div>
  )
}

export default PropertiesPanel