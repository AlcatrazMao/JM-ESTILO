import { useState } from 'react'
import { Viewer3D } from './Viewer3D'
import { StampCard } from './StampCard'
import { Stamp, GARMENTS, GCOLORS, Design, STAMPS } from '../lib/data'
import { saveDesign } from '../lib/api'

type Layout = 'split' | 'cinematic' | 'studio'

interface ViewerPageProps {
  layout: Layout
  selectedStamp: Stamp | null
  setSelectedStamp: (stamp: Stamp | null) => void
  savedDesigns: Design[]
  setSavedDesigns: (designs: Design[]) => void
  autoRotate: boolean
}

function SaveNotif() {
  return (
    <div className="fixed bottom-7 left-1/2 transform -translate-x-1/2 bg-surface-3 border border-gold-d px-5 py-2.5 flex items-center gap-2.5 z-[999] shadow-lg">
      <span className="text-gold text-sm">✓</span>
      <span className="text-xs tracking-[0.04em]">Diseño guardado</span>
    </div>
  )
}

function Controls({ garment, setGarment, gc, setGc }: { garment: { id: string; label: string }; setGarment: (g: any) => void; gc: string; setGc: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="flex gap-1 flex-wrap">
        {GARMENTS.map((g) => (
          <button key={g.id} onClick={() => setGarment(g)} className="px-2.5 py-1.5 text-[10px] tracking-[0.1em] uppercase" style={{ background: garment.id === g.id ? 'var(--gold)' : 'rgba(20,19,18,0.88)', color: garment.id === g.id ? '#080706' : 'var(--text-dim)', border: `1px solid ${garment.id === g.id ? 'var(--gold)' : 'var(--border-b)'}` }}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        {GCOLORS.map((c) => (
          <button key={c.v} onClick={() => setGc(c.v)} title={c.name} className="w-5 h-5 rounded-full" style={{ background: c.v, border: `2px solid ${gc === c.v ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`, transform: gc === c.v ? 'scale(1.22)' : 'scale(1)' }} />
        ))}
      </div>
    </div>
  )
}

function CatFilters({ filterCat, setFilterCat, categories }: { filterCat: string; setFilterCat: (c: string) => void; categories: string[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5 flex-shrink-0">
      {categories.map((c) => (
        <button key={c} onClick={() => setFilterCat(c)} className="px-3 py-1 text-[9px] tracking-[0.1em] uppercase" style={{ background: filterCat === c ? 'var(--gold)' : 'var(--surface-2)', color: filterCat === c ? '#080706' : 'var(--text-dim)', border: `1px solid ${filterCat === c ? 'var(--gold)' : 'var(--border)'}`, borderRadius: '2px' }}>
          {c}
        </button>
      ))}
    </div>
  )
}

export function ViewerPage({ layout, selectedStamp, setSelectedStamp, savedDesigns, setSavedDesigns, autoRotate }: ViewerPageProps) {
  const [garment, setGarment] = useState(GARMENTS[0])
  const [gc, setGc] = useState('#141414')
  const [filterCat, setFilterCat] = useState('Todos')
  const [notif, setNotif] = useState(false)

  const allCategories = ['Todos', ...Array.from(new Set(STAMPS.map((s: Stamp) => s.cat)))]
  const filtered = filterCat === 'Todos' ? STAMPS : STAMPS.filter((s: Stamp) => s.cat === filterCat)

  const handleSave = async () => {
    if (!selectedStamp) return
    const newDesign: Design = {
      id: Date.now(),
      garment: garment.id,
      stampId: selectedStamp.id,
      gc,
      at: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }),
      name: `${garment.label} ${selectedStamp.name}`,
    }
    setSavedDesigns([newDesign, ...savedDesigns])
    setNotif(true)
    setTimeout(() => setNotif(false), 2000)
    saveDesign({
      product_id: selectedStamp.id,
      garment_type: garment.id,
      garment_color: gc,
      custom_image_url: null,
    }).catch(() => {})
  }

  if (layout === 'split') {
    return (
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-[0_0_55%] relative bg-[#0a0908]">
          <Viewer3D garment={garment} garmentColor={gc} selectedStamp={selectedStamp} autoRotate={autoRotate} />
          <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
            <div className="pointer-events-all"><Controls garment={garment} setGarment={setGarment} gc={gc} setGc={setGc} /></div>
          </div>
          {selectedStamp && (
            <div className="absolute top-4 left-4 bg-[rgba(10,9,8,0.85)] backdrop-blur-sm border border-border-b px-3.5 py-2 flex items-center gap-2.5">
              <div>
                <div className="text-[11px] text-gold tracking-[0.04em]">{selectedStamp.name}</div>
                <div className="text-[10px] text-text-dim">${(selectedStamp.price / 100).toFixed(0)}</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col overflow-hidden border-l border-border">
          <div className="p-4 border-b border-border flex-shrink-0 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-serif text-xl font-light tracking-[0.06em]">Catálogo</div>
                <div className="text-[11px] text-text-dim mt-0.5">{filtered.length} estampados</div>
              </div>
              {selectedStamp && <button onClick={handleSave} className="btn-g">Guardar</button>}
            </div>
            <CatFilters filterCat={filterCat} setFilterCat={setFilterCat} categories={allCategories} />
          </div>
          <div className="flex-1 overflow-y-auto p-3.5">
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((s: Stamp) => <StampCard key={s.id} stamp={s} selected={selectedStamp?.id === s.id} onSelect={setSelectedStamp} />)}
            </div>
          </div>
        </div>
        {notif && <SaveNotif />}
      </div>
    )
  }

  if (layout === 'cinematic') {
    return (
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <div className="flex-1 relative bg-[#080706]">
          <Viewer3D garment={garment} garmentColor={gc} selectedStamp={selectedStamp} autoRotate={autoRotate} />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
            {GARMENTS.map((g) => (
              <button key={g.id} onClick={() => setGarment(g)} className="px-3 py-1.5 text-[9px] tracking-[0.12em] uppercase" style={{ background: garment.id === g.id ? 'var(--gold)' : 'rgba(12,11,10,0.88)', color: garment.id === g.id ? '#080706' : 'var(--text-mid)', border: `1px solid ${garment.id === g.id ? 'var(--gold)' : 'var(--border-b)'}` }}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            {GCOLORS.map((c) => (
              <button key={c.v} onClick={() => setGc(c.v)} title={c.name} className="w-[18px] h-[18px] rounded-full" style={{ background: c.v, border: `2px solid ${gc === c.v ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`, transform: gc === c.v ? 'scale(1.22)' : 'scale(1)' }} />
            ))}
          </div>
          {selectedStamp && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-[rgba(10,9,8,0.85)] backdrop-blur-sm border border-border-b px-4 py-2 flex items-center gap-3">
              <div>
                <div className="text-[12px] text-gold tracking-[0.04em]">{selectedStamp.name}</div>
                <div className="text-[10px] text-text-dim">${(selectedStamp.price / 100).toFixed(0)} · {selectedStamp.cat}</div>
              </div>
              <button onClick={handleSave} className="btn-g ml-2">Guardar</button>
            </div>
          )}
        </div>
        <div className="h-[170px] bg-surface border-t border-border flex flex-col flex-shrink-0">
          <div className="flex items-center gap-3 p-2 border-b border-border">
            <span className="font-serif text-sm font-light tracking-[0.08em] text-text-mid">Estampados</span>
            <CatFilters filterCat={filterCat} setFilterCat={setFilterCat} categories={allCategories} />
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-2.5 flex gap-2.5">
            {filtered.map((s: Stamp) => (
              <div key={s.id} className="flex-shrink-0 w-[90px] h-[110px] p-2 cursor-pointer flex flex-col gap-1.5" style={{ background: selectedStamp?.id === s.id ? 'var(--surface-3)' : 'var(--surface-2)', border: `1px solid ${selectedStamp?.id === s.id ? 'var(--gold)' : 'var(--border)'}` }} onClick={() => setSelectedStamp(s)}>
                <div className="flex-1 bg-[#0e0d0c]" />
                <div className="text-[9px] tracking-[0.04em] whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: selectedStamp?.id === s.id ? 'var(--gold)' : 'var(--text-dim)' }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>
        {notif && <SaveNotif />}
      </div>
    )
  }

  // studio layout
  return (
    <div className="flex flex-1 overflow-hidden relative">
      <div className="flex-[0_0_58%] flex flex-col overflow-hidden border-r border-border">
        <div className="p-4 border-b border-border flex-shrink-0 flex flex-col gap-3">
          <div className="font-serif text-2xl font-light tracking-[0.06em]">Colección <span className="text-gold">2026</span></div>
          <CatFilters filterCat={filterCat} setFilterCat={setFilterCat} categories={allCategories} />
        </div>
        <div className="flex-1 overflow-y-auto p-3.5">
          <div className="grid grid-cols-4 gap-2">
            {filtered.map((s: Stamp) => <StampCard key={s.id} stamp={s} selected={selectedStamp?.id === s.id} onSelect={setSelectedStamp} compact />)}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border flex-shrink-0 flex items-center justify-between">
          <div className="font-serif text-sm font-light tracking-[0.06em] text-text-mid">Vista Previa 3D</div>
          {selectedStamp && <button onClick={handleSave} className="btn-g">Guardar diseño</button>}
        </div>
        <div className="flex-1 relative bg-[#0a0908]">
          <Viewer3D garment={garment} garmentColor={gc} selectedStamp={selectedStamp} autoRotate={autoRotate} />
          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <div className="pointer-events-all"><Controls garment={garment} setGarment={setGarment} gc={gc} setGc={setGc} /></div>
          </div>
          {!selectedStamp && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center opacity-35">
                <div className="font-serif text-3xl font-light tracking-[0.1em] text-gold">Seleccioná</div>
                <div className="text-[11px] tracking-[0.1em] uppercase text-text-dim mt-2">un estampado del catálogo</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {notif && <SaveNotif />}
    </div>
  )
}