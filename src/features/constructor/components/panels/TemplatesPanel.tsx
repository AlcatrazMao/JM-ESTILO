// Templates Panel - Pre-defined design templates

import { useDesignStore } from '../../store/designStore'

interface Template {
  id: string
  name: string
  description: string
  thumbnail?: string
  create: () => void
}

const TEMPLATES: Template[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty canvas',
    create: () => {
      const store = useDesignStore.getState()
      // Clear all except root
      const nodes: Record<string, any> = { 'design-root': store.nodes['design-root'] }
      store.nodes = nodes
      store.setCanvasBackground('#ffffff')
    },
  },
  {
    id: 'text-center',
    name: 'Text Center',
    description: 'Centered text design',
    create: () => {
      const { addNode, canvasSize } = useDesignStore.getState()
      const textId = addNode('text')
      useDesignStore.getState().patchNode(textId, {
        position: { 
          x: canvasSize.w / 2 - 200, 
          y: canvasSize.h / 2 - 40 
        },
        size: { w: 400, h: 80 },
        styles: { 
          textAlign: 'center',
          fontSize: 48,
          fontWeight: 700,
          color: '#000000',
        },
        content: { text: 'YOUR TEXT' },
      })
    },
  },
  {
    id: 'logo-box',
    name: 'Logo Box',
    description: 'Image with text below',
    create: () => {
      const { addNode, canvasSize } = useDesignStore.getState()
      const imgId = addNode('image')
      const textId = addNode('text')
      
      const centerX = canvasSize.w / 2 - 150
      
      useDesignStore.getState().patchNode(imgId, {
        position: { x: centerX, y: 100 },
        size: { w: 300, h: 300 },
        styles: { 
          background: '#f0f0f0',
          borderRadius: 0,
          objectFit: 'contain',
        },
        content: { src: '', alt: 'Logo' },
      })
      
      useDesignStore.getState().patchNode(textId, {
        position: { x: centerX, y: 420 },
        size: { w: 300, h: 60 },
        styles: { 
          textAlign: 'center',
          fontSize: 36,
          fontWeight: 700,
          color: '#000000',
        },
        content: { text: 'BRAND NAME' },
      })
    },
  },
  {
    id: 'band',
    name: 'Band Strip',
    description: 'Horizontal band design',
    create: () => {
      const { addNode, canvasSize } = useDesignStore.getState()
      const bgId = addNode('div')
      const textId = addNode('text')
      
      useDesignStore.getState().patchNode(bgId, {
        position: { x: 0, y: canvasSize.h / 2 - 100 },
        size: { w: canvasSize.w, h: 200 },
        styles: { 
          background: '#000000',
        },
      })
      
      useDesignStore.getState().patchNode(textId, {
        position: { x: 0, y: canvasSize.h / 2 - 40 },
        size: { w: canvasSize.w, h: 80 },
        styles: { 
          textAlign: 'center',
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
        },
        content: { text: 'BAND NAME' },
      })
    },
  },
  {
    id: 'sponsor',
    name: 'Sponsor Badge',
    description: 'Small sponsor logo',
    create: () => {
      const { addNode, canvasSize } = useDesignStore.getState()
      const boxId = addNode('div')
      const textId = addNode('text')
      
      const size = 200
      const x = canvasSize.w - size - 50
      const y = 50
      
      useDesignStore.getState().patchNode(boxId, {
        position: { x, y },
        size: { w: size, h: size },
        styles: { 
          background: '#ffd700',
          borderRadius: 8,
        },
      })
      
      useDesignStore.getState().patchNode(textId, {
        position: { x: x + 10, y: y + size / 2 - 20 },
        size: { w: size - 20, h: 40 },
        styles: { 
          textAlign: 'center',
          fontSize: 24,
          fontWeight: 700,
          color: '#000000',
        },
        content: { text: 'SPONSOR' },
      })
    },
  },
  {
    id: 'numbered',
    name: 'Numbered',
    description: 'Big number design',
    create: () => {
      const { addNode, canvasSize } = useDesignStore.getState()
      const textId = addNode('text')
      
      useDesignStore.getState().patchNode(textId, {
        position: { x: 50, y: canvasSize.h / 2 - 150 },
        size: { w: 400, h: 300 },
        styles: { 
          textAlign: 'left',
          fontSize: 200,
          fontWeight: 700,
          color: '#000000',
        },
        content: { text: '01' },
      })
    },
  },
]

export function TemplatesPanel() {
  const handleCreateTemplate = (template: Template) => {
    try {
      template.create()
    } catch (error) {
      console.error('Template creation failed:', error)
    }
  }

  return (
    <div className="w-56 bg-surface border-l border-bg-dim p-3 overflow-y-auto">
      <h3 className="text-xs font-bold text-gold mb-3">TEMPLATES</h3>
      
      <div className="space-y-2">
        {TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => handleCreateTemplate(template)}
            className="w-full text-left p-3 bg-bg hover:bg-bg-dim rounded transition-colors"
          >
            <p className="text-xs font-bold">{template.name}</p>
            <p className="text-xs text-text-dim">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default TemplatesPanel