// Builder Store - Adapted for JM-ESTILO print designs
import { create } from 'zustand'
import { persistenceActions } from './persistence'

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

const ROOT_ID = 'design-root'
const CANVAS_WIDTH = 1200
const CANVAS_HEIGHT = 1600
const HISTORY_LIMIT = 30

const makeId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`

const createNodeTemplate = (type: Exclude<DesignNodeType, 'canvas'>, parentId: string): DesignNode => {
  const id = makeId(type)
  if (type === 'text') {
    return { id, name: 'Text', type, parentId, position: { x: 100, y: 100 }, size: { w: 400, h: 80 }, styles: { color: '#000000', fontSize: 24, fontWeight: 400, textAlign: 'left' }, content: { text: 'Your text here' }, children: [], locked: false, visible: true }
  }
  if (type === 'image') {
    return { id, name: 'Image', type, parentId, position: { x: 100, y: 100 }, size: { w: 400, h: 400 }, styles: { objectFit: 'contain', borderRadius: 0 }, content: { src: '', alt: '' }, children: [], locked: false, visible: true }
  }
  return { id, name: 'Group', type, parentId, position: { x: 100, y: 100 }, size: { w: 300, h: 300 }, styles: { background: 'transparent', border: '1px dashed #ccc', borderRadius: 8, padding: 12 }, children: [], locked: false, visible: true }
}

type DesignStore = {
  nodes: Record<string, DesignNode>
  selectedIds: string[]
  activeContainerId: string | null
  canvasSize: { w: number; h: number }
  canvasBackground: string
  history: DesignSnapshot[]
  historyIndex: number
  clipboard: DesignNode[]
  addNode: (type: Exclude<DesignNodeType, 'canvas'>) => string
  updateNode: (id: string, updater: (node: DesignNode) => DesignNode) => void
  patchNode: (id: string, patch: Partial<DesignNode>) => void
  moveNodes: (ids: string[], delta: { x: number; y: number }) => void
  deleteNodes: (ids: string[]) => void
  deleteSelected: () => void
  selectOne: (id: string) => void
  setSelection: (ids: string[]) => void
  clearSelection: () => void
  copySelected: () => void
  paste: () => void
  duplicateSelected: () => void
  updateContent: (id: string, content: DesignNodeContent) => void
  setCanvasBackground: (bg: string) => void
  undo: () => void
  redo: () => void
  saveDesign: (name: string) => void
  loadDesign: (name: string) => void
  deleteDesign: (name: string) => void
}

export const useDesignStore = create<DesignStore>((set, get) => {
  const pushHistory = () => {
    const { nodes, selectedIds, activeContainerId } = get()
    const snapshot: DesignSnapshot = { nodes: JSON.parse(JSON.stringify(nodes)), selectedIds: [...selectedIds], activeContainerId }
    const { history, historyIndex } = get()
    const trimmed = history.slice(0, historyIndex + 1)
    const nextHistory = [...trimmed, snapshot]
    if (nextHistory.length > HISTORY_LIMIT) nextHistory.splice(0, nextHistory.length - HISTORY_LIMIT)
    return { history: nextHistory, historyIndex: nextHistory.length - 1 }
  }

  const initialNodes: Record<string, DesignNode> = {
    [ROOT_ID]: { id: ROOT_ID, name: 'Design', type: 'canvas', parentId: null, position: { x: 0, y: 0 }, size: { w: CANVAS_WIDTH, h: CANVAS_HEIGHT }, styles: { background: '#ffffff' }, children: [], locked: false, visible: true }
  }
  const initialSnapshot: DesignSnapshot = { nodes: JSON.parse(JSON.stringify(initialNodes)), selectedIds: [], activeContainerId: ROOT_ID }

  return {
    nodes: initialNodes,
    selectedIds: [],
    activeContainerId: ROOT_ID,
    canvasSize: { w: CANVAS_WIDTH, h: CANVAS_HEIGHT },
    canvasBackground: '#ffffff',
    history: [initialSnapshot],
    historyIndex: 0,
    clipboard: [],
    addNode: (type) => {
      const state = get()
      const parentId = state.activeContainerId ?? ROOT_ID
      const parent = state.nodes[parentId] ?? state.nodes[ROOT_ID]
      const template = createNodeTemplate(type, parent.id)
      const node = { ...template, position: { x: Math.round(template.position.x), y: Math.round(template.position.y) }, size: { w: Math.round(template.size.w), h: Math.round(template.size.h) } }
      const nextNodes = { ...state.nodes, [node.id]: node }
      nextNodes[parent.id] = { ...parent, children: [...parent.children, node.id] }
      const meta = pushHistory()
      set({ nodes: nextNodes, selectedIds: [node.id], ...meta })
      return node.id
    },
    updateNode: (id, updater) => {
      const node = get().nodes[id]
      if (!node) return
      const nextNodes = { ...get().nodes, [id]: updater(node) }
      set({ nodes: nextNodes, ...pushHistory() })
    },
    patchNode: (id, patch) => get().updateNode(id, (node) => ({ ...node, ...patch })),
    moveNodes: (ids, delta) => {
      const nextNodes = { ...get().nodes }
      for (const id of ids) {
        const node = nextNodes[id]
        if (node && !node.locked) {
          nextNodes[id] = { ...node, position: { x: Math.round(node.position.x + delta.x), y: Math.round(node.position.y + delta.y) } }
        }
      }
      set({ nodes: nextNodes, ...pushHistory() })
    },
    deleteNodes: (ids) => {
      if (ids.length === 0) return
      const nextNodes = { ...get().nodes }
      const toDelete = new Set<string>()
      const findDesc = (id: string) => {
        const node = nextNodes[id]
        if (!node) return []
        return [id, ...node.children.flatMap(findDesc)]
      }
      ids.forEach(id => findDesc(id).forEach(d => toDelete.add(d)))
      for (const id of toDelete) {
        const node = nextNodes[id]
        if (node?.parentId && nextNodes[node.parentId]) {
          nextNodes[node.parentId] = { ...nextNodes[node.parentId], children: nextNodes[node.parentId].children.filter(c => c !== id) }
        }
        delete nextNodes[id]
      }
      set({ nodes: nextNodes, selectedIds: [], ...pushHistory() })
    },
    deleteSelected: () => get().deleteNodes(get().selectedIds),
    selectOne: (id) => set({ selectedIds: [id] }),
    setSelection: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),
    copySelected: () => set({ clipboard: get().selectedIds.map(id => get().nodes[id]).filter(Boolean) }),
    paste: () => {
      const { clipboard, nodes } = get()
      if (clipboard.length === 0) return
      const nextNodes = { ...nodes }
      const newIds: string[] = []
      for (const node of clipboard) {
        const newId = makeId(node.type)
        newIds.push(newId)
        nextNodes[newId] = { ...node, id: newId, position: { x: node.position.x + 20, y: node.position.y + 20 } }
      }
      nextNodes[ROOT_ID] = { ...nextNodes[ROOT_ID], children: [...nextNodes[ROOT_ID].children, ...newIds] }
      set({ nodes: nextNodes, selectedIds: newIds, ...pushHistory() })
    },
    duplicateSelected: () => { get().copySelected(); get().paste() },
    updateContent: (id, content) => {
      const node = get().nodes[id]
      if (!node) return
      const nextNodes = { ...get().nodes, [id]: { ...node, content } }
      set({ nodes: nextNodes, ...pushHistory() })
    },
    setCanvasBackground: (bg) => set({ canvasBackground: bg }),
    undo: () => {
      const { history, historyIndex } = get()
      if (historyIndex <= 0) return
      const nextIndex = historyIndex - 1
      const snapshot = history[nextIndex]
      set({ nodes: JSON.parse(JSON.stringify(snapshot.nodes)), selectedIds: [...snapshot.selectedIds], activeContainerId: snapshot.activeContainerId, historyIndex: nextIndex })
    },
    redo: () => {
      const { history, historyIndex } = get()
      if (historyIndex >= history.length - 1) return
      const nextIndex = historyIndex + 1
      const snapshot = history[nextIndex]
      set({ nodes: JSON.parse(JSON.stringify(snapshot.nodes)), selectedIds: [...snapshot.selectedIds], activeContainerId: snapshot.activeContainerId, historyIndex: nextIndex })
    },
    saveDesign: (name) => persistenceActions.saveDesign(get, set, name),
    loadDesign: (name) => persistenceActions.loadDesign(get, set, name),
    deleteDesign: (name) => persistenceActions.deleteDesign(name),
  }
})

export const rootDesignId = ROOT_ID