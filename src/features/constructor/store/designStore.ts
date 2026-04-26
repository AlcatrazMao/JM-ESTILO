// Builder Store - Adapted for JM-ESTILO print designs
// Based on PROYECTO_TIENDA's freeBuilderStore
// Simplified for print design workflow

import { create } from 'zustand'

// ─── Types ──────────────────────────────────────────────────────────────

export type DesignNodeType = 'canvas' | 'text' | 'image' | 'div'

export type TextContent = { text: string }
export type ImageContent = { src: string; alt: string }
export type DivContent = Record<string, never>

export type DesignNodeContent = TextContent | ImageContent | DivContent

export type DesignNode = {
  id: string
  name: string
  type: DesignNodeType
  parentId: string | null
  position: { x: number; y: number }
  size: { w: number; h: number }
  styles: Record<string, string | number>
  content?: DesignNodeContent
  children: string[]
  locked: boolean
  visible: boolean
}

export type DesignSnapshot = {
  nodes: Record<string, DesignNode>
  selectedIds: string[]
  activeContainerId: string | null
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ROOT_ID = 'design-root'
const CANVAS_WIDTH = 1200  // ~40cm at 300 DPI
const CANVAS_HEIGHT = 1600 // ~53cm at 300 DPI
const HISTORY_LIMIT = 30

const makeId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`

// ─── Node Templates ──────────────────────────────────────────────────────────────

const createNodeTemplate = (type: Exclude<DesignNodeType, 'canvas'>, parentId: string): DesignNode => {
  const id = makeId(type)

  if (type === 'text') {
    return {
      id,
      name: 'Text',
      type,
      parentId,
      position: { x: 100, y: 100 },
      size: { w: 400, h: 80 },
      styles: { color: '#000000', fontSize: 24, fontWeight: 400, textAlign: 'left' },
      content: { text: 'Your text here' },
      children: [],
      locked: false,
      visible: true,
    }
  }

  if (type === 'image') {
    return {
      id,
      name: 'Image',
      type,
      parentId,
      position: { x: 100, y: 100 },
      size: { w: 400, h: 400 },
      styles: { objectFit: 'contain', borderRadius: 0 },
      content: { src: '', alt: '' },
      children: [],
      locked: false,
      visible: true,
    }
  }

  // div (container)
  return {
    id,
    name: 'Group',
    type,
    parentId,
    position: { x: 100, y: 100 },
    size: { w: 300, h: 300 },
    styles: { background: 'transparent', border: '1px dashed #ccc', borderRadius: 8, padding: 12 },
    children: [],
    locked: false,
    visible: true,
  }
}

// ─── Store ──────────────────────────────────────────────────────────────

type DesignStore = {
  // Nodes
  nodes: Record<string, DesignNode>
  selectedIds: string[]
  activeContainerId: string | null

  // Canvas settings
  canvasSize: { w: number; h: number }
  canvasBackground: string

  // History
  history: DesignSnapshot[]
  historyIndex: number

  // Actions
  addNode: (type: Exclude<DesignNodeType, 'canvas'>) => string
  updateNode: (id: string, updater: (node: DesignNode) => DesignNode) => void
  patchNode: (id: string, patch: Partial<DesignNode>) => void
  moveNodes: (ids: string[], delta: { x: number; y: number }) => void
  deleteNodes: (ids: string[]) => void
  deleteSelected: () => void

  // Selection
  selectOne: (id: string) => void
  setSelection: (ids: string[]) => void
  clearSelection: () => void

  // Content
  updateContent: (id: string, content: DesignNodeContent) => void

  // Canvas
  setCanvasBackground: (bg: string) => void

  // History
  undo: () => void
  redo: () => void
}

const createInitialNodes = (): Record<string, DesignNode> => ({
  [ROOT_ID]: {
    id: ROOT_ID,
    name: 'Design',
    type: 'canvas',
    parentId: null,
    position: { x: 0, y: 0 },
    size: { w: CANVAS_WIDTH, h: CANVAS_HEIGHT },
    styles: { background: '#ffffff' },
    children: [],
    locked: false,
    visible: true,
  },
})

export const useDesignStore = create<DesignStore>((set, get) => {
  const pushHistory = () => {
    const { nodes, selectedIds, activeContainerId } = get()
    const snapshot: DesignSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      selectedIds: [...selectedIds],
      activeContainerId,
    }
    const { history, historyIndex } = get()
    const trimmed = history.slice(0, historyIndex + 1)
    const nextHistory = [...trimmed, snapshot]
    if (nextHistory.length > HISTORY_LIMIT) {
      nextHistory.splice(0, nextHistory.length - HISTORY_LIMIT)
    }
    const nextIndex = nextHistory.length - 1
    return { history: nextHistory, historyIndex: nextIndex }
  }

  const initialNodes = createInitialNodes()
  const initialSnapshot: DesignSnapshot = {
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    selectedIds: [],
    activeContainerId: ROOT_ID,
  }

  return {
    nodes: initialNodes,
    selectedIds: [],
    activeContainerId: ROOT_ID,
    canvasSize: { w: CANVAS_WIDTH, h: CANVAS_HEIGHT },
    canvasBackground: '#ffffff',
    history: [initialSnapshot],
    historyIndex: 0,

    addNode: (type) => {
      const state = get()
      const parentId = state.activeContainerId ?? ROOT_ID
      const parent = state.nodes[parentId] ?? state.nodes[ROOT_ID]
      const template = createNodeTemplate(type, parent.id)
      const node: DesignNode = {
        ...template,
        position: { x: Math.round(template.position.x), y: Math.round(template.position.y) },
        size: { w: Math.round(template.size.w), h: Math.round(template.size.h) },
      }
      const nextNodes = { ...state.nodes }
      nextNodes[node.id] = node
      nextNodes[parent.id] = { ...parent, children: [...parent.children, node.id] }
      const meta = pushHistory()
      set({ nodes: nextNodes, selectedIds: [node.id], ...meta })
      return node.id
    },

    updateNode: (id, updater) => {
      const state = get()
      const node = state.nodes[id]
      if (!node) return
      const nextNodes = { ...state.nodes }
      nextNodes[id] = updater(node)
      const meta = pushHistory()
      set({ nodes: nextNodes, ...meta })
    },

    patchNode: (id, patch) => {
      get().updateNode(id, (node) => ({ ...node, ...patch }))
    },

    moveNodes: (ids, delta) => {
      const state = get()
      const nextNodes = { ...state.nodes }
      for (const id of ids) {
        const node = nextNodes[id]
        if (node && !node.locked) {
          nextNodes[id] = {
            ...node,
            position: {
              x: Math.round(node.position.x + delta.x),
              y: Math.round(node.position.y + delta.y),
            },
          }
        }
      }
      const meta = pushHistory()
      set({ nodes: nextNodes, ...meta })
    },

    deleteNodes: (ids) => {
      const state = get()
      if (ids.length === 0) return
      const nextNodes = { ...state.nodes }
      const toDelete = new Set(ids)
      
      // Find all descendants
      const findDescendants = (id: string): string[] => {
        const node = nextNodes[id]
        if (!node) return []
        return [id, ...node.children.flatMap(findDescendants)]
      }
      ids.forEach(id => findDescendants(id).forEach(d => toDelete.add(d)))

      // Remove from parent's children
      for (const id of toDelete) {
        const node = nextNodes[id]
        if (node?.parentId && nextNodes[node.parentId]) {
          const parent = nextNodes[node.parentId]
          nextNodes[node.parentId] = {
            ...parent,
            children: parent.children.filter(c => c !== id),
          }
        }
      }

      // Delete nodes
      for (const id of toDelete) {
        delete nextNodes[id]
      }

      const meta = pushHistory()
      set({ nodes: nextNodes, selectedIds: [], ...meta })
    },

    deleteSelected: () => {
      get().deleteNodes(get().selectedIds)
    },

    selectOne: (id) => {
      set({ selectedIds: [id] })
    },

    setSelection: (ids) => {
      set({ selectedIds: ids })
    },

    clearSelection: () => {
      set({ selectedIds: [] })
    },

    updateContent: (id, content) => {
      get().patchNode(id, { content })
    },

    setCanvasBackground: (background) => {
      set({ canvasBackground: background })
      const { nodes, historyIndex, history } = get()
      const nextNodes = { ...nodes }
      if (nextNodes[ROOT_ID]) {
        nextNodes[ROOT_ID] = { ...nextNodes[ROOT_ID], styles: { ...nextNodes[ROOT_ID].styles, background } }
      }
      const meta = pushHistory()
      set({ nodes: nextNodes, ...meta })
    },

    undo: () => {
      const { history, historyIndex } = get()
      if (historyIndex <= 0) return
      const nextIndex = historyIndex - 1
      const snapshot = history[nextIndex]
      set({
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        selectedIds: [...snapshot.selectedIds],
        activeContainerId: snapshot.activeContainerId,
        historyIndex: nextIndex,
      })
    },

    redo: () => {
      const { history, historyIndex } = get()
      if (historyIndex >= history.length - 1) return
      const nextIndex = historyIndex + 1
      const snapshot = history[nextIndex]
      set({
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        selectedIds: [...snapshot.selectedIds],
        activeContainerId: snapshot.activeContainerId,
        historyIndex: nextIndex,
      })
    },
  }
})

// Export helpers
export const rootDesignId = ROOT_ID