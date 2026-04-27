// Storage helpers for design persistence
import { saveDesignLocally, loadDesignLocally, listDesignsLocally } from '../../../lib/storage'

export const persistenceActions = {
  saveDesign: (get: any, set: any, name: string) => {
    const state = get()
    const designData = {
      nodes: state.nodes,
      canvasBackground: state.canvasBackground,
      canvasSize: state.canvasSize,
    }
    saveDesignLocally(name, designData)
  },
  loadDesign: (get: any, set: any, name: string) => {
    const data = loadDesignLocally(name)
    if (data) {
      set({ 
        nodes: data.nodes, 
        canvasBackground: data.canvasBackground, 
        canvasSize: data.canvasSize,
        history: [{ nodes: data.nodes, selectedIds: [], activeContainerId: null }],
        historyIndex: 0
      })
    }
  },
  deleteDesign: (name: string) => {
    localStorage.removeItem(`jm-estilo-${name}`)
  }
}