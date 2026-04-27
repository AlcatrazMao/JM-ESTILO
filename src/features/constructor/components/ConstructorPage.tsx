// Constructor Page - Main Layout

import { useState } from 'react'
import Canvas from './canvas/Canvas'
import { TopToolbar, ToolbarActions } from './toolbar/Toolbar'
import { LayersPanel } from './panels/LayersPanel'
import { PropertiesPanel } from './panels/PropertiesPanel'
import { ExportPanel } from './panels/ExportPanel'
import { TemplatesPanel } from './panels/TemplatesPanel'
import { SavePanel } from './panels/SavePanel'
import { useConstructor, ConstructorProvider } from '../context/ConstructorContext'

export default function ConstructorPage() {
  const [mockupMode, setMockupMode] = useState(false)
  const [zoom, setZoom] = useState(0.4)

  return (
    <ConstructorProvider>
      <ConstructorContent zoom={zoom} setZoom={setZoom} mockupMode={mockupMode} setMockupMode={setMockupMode} />
    </ConstructorProvider>
  )
}

function ConstructorContent({ zoom, setZoom, mockupMode, setMockupMode }: any) {
  return (
    <div className="h-screen flex flex-col bg-bg text-surface overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 border-b border-bg-dim">
        <TopToolbar />
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setMockupMode(!mockupMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              mockupMode ? 'bg-gold text-surface ring-2 ring-gold' : 'bg-bg hover:bg-bg-dim'
            }`}
          >
            {mockupMode ? '✅ Mockup View' : '👕 View on Shirt'}
          </button>
          <ToolbarActions />
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Layers & Templates */}
        <div className="w-56 flex flex-col border-r border-bg-dim overflow-y-auto">
          <LayersPanel />
          <div className="h-px bg-bg-dim my-2" />
          <TemplatesPanel />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 relative">
          <Canvas zoom={zoom} onZoomChange={setZoom} mockupMode={mockupMode} />
        </div>

        {/* Right Panel: Properties, Export, Save */}
        <div className="w-56 flex flex-col border-l border-bg-dim overflow-y-auto">
          <PropertiesPanel />
          <div className="h-px bg-bg-dim my-2" />
          <ExportPanel />
          <div className="h-px bg-bg-dim my-2" />
          <SavePanel />
        </div>
      </div>
    </div>
  )
}