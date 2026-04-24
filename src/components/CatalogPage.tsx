import { useState } from 'react'
import { Stamp, STAMPS } from '../lib/data'
import { StampCard } from './StampCard'

interface CatalogPageProps {
  selectedStamp: Stamp | null
  setSelectedStamp: (stamp: Stamp | null) => void
  setPage: (page: 'viewer' | 'catalog' | 'designs') => void
}

export function CatalogPage({ selectedStamp, setSelectedStamp, setPage }: CatalogPageProps) {
  const [filterCat, setFilterCat] = useState('Todos')
  const [sort, setSort] = useState<'default' | 'price_asc' | 'price_desc'>('default')

  const categories = ['Todos', ...Array.from(new Set(STAMPS.map((s) => s.cat)))]

  let stamps = [...STAMPS].filter((s) => filterCat === 'Todos' || s.cat === filterCat)

  if (sort === 'price_asc') stamps.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') stamps.sort((a, b) => b.price - a.price)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border flex-shrink-0">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="font-serif text-[26px] font-light tracking-[0.06em]">
              Catálogo de <span className="text-gold italic">Estampados</span>
            </div>
            <div className="text-[11px] text-text-dim mt-1 tracking-[0.04em]">
              {stamps.length} diseños disponibles
            </div>
          </div>
          <div className="flex gap-1.5 items-center">
            <span className="text-[10px] text-text-dim tracking-[0.1em] uppercase">Orden:</span>
            {[
              { v: 'default', l: 'Destacados' },
              { v: 'price_asc', l: 'Menor precio' },
              { v: 'price_desc', l: 'Mayor precio' },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setSort(o.v as typeof sort)}
                className="px-2.5 py-1 text-[9px] tracking-[0.08em] uppercase transition-all duration-200"
                style={{
                  background: sort === o.v ? 'var(--surface-3)' : 'transparent',
                  border: `1px solid ${sort === o.v ? 'var(--border-b)' : 'var(--border)'}`,
                  color: sort === o.v ? 'var(--text)' : 'var(--text-dim)',
                  borderRadius: '2px',
                }}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className="px-3 py-1.5 text-[9px] tracking-[0.1em] uppercase transition-all duration-200"
              style={{
                background: filterCat === c ? 'var(--gold)' : 'var(--surface-2)',
                color: filterCat === c ? '#080706' : 'var(--text-dim)',
                border: `1px solid ${filterCat === c ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: '2px',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
        >
          {stamps.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedStamp(s)
                setPage('viewer')
              }}
              className="cursor-pointer"
            >
              <StampCard
                stamp={s}
                selected={selectedStamp?.id === s.id}
                onSelect={(stamp) => {
                  setSelectedStamp(stamp)
                  setPage('viewer')
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}