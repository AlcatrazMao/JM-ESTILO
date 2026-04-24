interface TweaksPanelProps {
  tweaks: Record<string, string | boolean>
  onChange: (tweaks: Record<string, string | boolean>) => void
  visible: boolean
}

export function TweaksPanel({ tweaks, onChange, visible }: TweaksPanelProps) {
  if (!visible) return null

  const layouts = [
    { v: 'split', l: 'Split — 3D + Catálogo' },
    { v: 'cinematic', l: 'Cinemático — Full 3D' },
    { v: 'studio', l: 'Studio — Galería' },
  ]

  return (
    <div className="fixed bottom-6 right-6 bg-surface border border-border-b w-60 z-[500] shadow-xl">
      <div className="px-3.5 py-3 border-b border-border font-serif text-sm tracking-[0.08em] text-text-mid">
        Tweaks
      </div>
      <div className="p-3.5">
        {/* Layout */}
        <div className="mb-3.5">
          <div className="text-[10px] tracking-[0.12em] uppercase text-text-dim mb-2">Layout</div>
          <div className="flex flex-col gap-1.5">
            {layouts.map((o) => (
              <button
                key={o.v}
                onClick={() => onChange({ ...tweaks, layout: o.v })}
                className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] tracking-[0.04em] cursor-pointer transition-all duration-200 text-left"
                style={{
                  background: tweaks.layout === o.v ? 'var(--surface-3)' : 'transparent',
                  border: `1px solid ${tweaks.layout === o.v ? 'var(--gold-d)' : 'var(--border)'}`,
                  color: tweaks.layout === o.v ? 'var(--gold)' : 'var(--text-dim)',
                  borderRadius: '2px',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: tweaks.layout === o.v ? 'var(--gold)' : 'var(--border-b)',
                  }}
                />
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-rotate */}
        <div className="mb-3.5">
          <div className="text-[10px] tracking-[0.12em] uppercase text-text-dim mb-2">Auto-rotación</div>
          <button
            onClick={() => onChange({ ...tweaks, autoRotate: !tweaks.autoRotate })}
            className="flex items-center gap-2 text-[11px] cursor-pointer py-1"
            style={{ color: tweaks.autoRotate ? 'var(--gold)' : 'var(--text-dim)' }}
          >
            <div
              className="w-[30px] h-4 rounded-full relative transition-colors duration-200 flex-shrink-0"
              style={{
                background: tweaks.autoRotate ? 'var(--gold-d)' : 'var(--border-b)',
              }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                style={{
                  left: tweaks.autoRotate ? 14 : 2,
                  background: tweaks.autoRotate ? 'var(--gold)' : 'var(--text-dim)',
                }}
              />
            </div>
            {tweaks.autoRotate ? 'Activada' : 'Desactivada'}
          </button>
        </div>

        {/* Accent color */}
        <div>
          <div className="text-[10px] tracking-[0.12em] uppercase text-text-dim mb-2">Color de acento</div>
          <div className="flex gap-2 items-center">
            <div
              className="w-5 h-5 rounded-full border border-border-b"
              style={{ background: tweaks.accentColor as string }}
            />
            <input
              type="color"
              value={tweaks.accentColor as string}
              onChange={(e) => onChange({ ...tweaks, accentColor: e.target.value })}
              className="w-12 h-5 border-none bg-transparent cursor-pointer p-0"
            />
            <span className="text-[11px] text-text-dim font-variant-numeric tabular-nums">
              {tweaks.accentColor as string}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}