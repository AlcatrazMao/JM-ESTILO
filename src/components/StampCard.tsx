import { useState } from 'react'
import { Stamp } from '../lib/data'
import { StampThumb } from './StampThumb'

interface StampCardProps {
  stamp: Stamp
  selected: boolean
  onSelect: (stamp: Stamp) => void
  compact?: boolean
}

export function StampCard({ stamp, selected, onSelect, compact = false }: StampCardProps) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onClick={() => onSelect(stamp)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer transition-all duration-180 flex flex-col gap-1.5"
      style={{
        background: selected ? 'var(--surface-3)' : hover ? 'var(--surface-2)' : 'var(--surface)',
        border: `1px solid ${selected ? 'var(--gold)' : hover ? 'var(--border-b)' : 'var(--border)'}`,
        padding: compact ? '8px' : '12px',
      }}
    >
      <div
        className="w-full aspect-square bg-[#0e0d0c] flex items-center justify-center overflow-hidden"
      >
        <StampThumb stamp={stamp} size={compact ? 70 : 88} />
      </div>
      <div>
        <div
          className="text-xs tracking-[0.02em] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ color: selected ? 'var(--gold)' : 'var(--text)' }}
        >
          {stamp.name}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] text-text-dim tracking-[0.08em] uppercase">
            {stamp.cat}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--gold)' }}>
            ${(stamp.price / 100).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  )
}