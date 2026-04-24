import { useRef, useEffect } from 'react'
import { Design, STAMPS, GARMENTS } from '../lib/data'

interface MyDesignsPageProps {
  savedDesigns: Design[]
  setSavedDesigns: (designs: Design[]) => void
  setSelectedStamp: (stamp: any) => void
  setPage: (page: 'viewer' | 'catalog' | 'designs') => void
}

function DesignThumb({ design }: { design: Design }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 160
    const H = 200
    canvas.width = W
    canvas.height = H
    
    const stamp = STAMPS.find((s) => s.id === design.stampId)

    ctx.fillStyle = '#0e0d0c'
    ctx.fillRect(0, 0, W, H)

    const sc = W * 0.34
    const cx = W / 2
    const cy = H / 2 + H * 0.04

    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(sc, sc)

    ctx.beginPath()
    if (design.garment === 'tshirt' || design.garment === 'crewneck') {
      ctx.moveTo(-0.14, 0.86)
      ctx.bezierCurveTo(-0.08, 0.93, 0.08, 0.93, 0.14, 0.86)
      ctx.lineTo(0.27, 0.76)
      ctx.lineTo(0.66, 0.86)
      ctx.lineTo(0.80, 0.60)
      ctx.lineTo(0.56, 0.50)
      ctx.lineTo(0.43, 0.56)
      ctx.lineTo(0.43, -0.90)
      ctx.lineTo(-0.43, -0.90)
      ctx.lineTo(-0.43, 0.56)
      ctx.lineTo(-0.56, 0.50)
      ctx.lineTo(-0.80, 0.60)
      ctx.lineTo(-0.66, 0.86)
      ctx.lineTo(-0.27, 0.76)
      ctx.closePath()
    } else if (design.garment === 'hoodie') {
      ctx.moveTo(-0.20, 0.84)
      ctx.bezierCurveTo(-0.18, 1.10, 0.18, 1.10, 0.20, 0.84)
      ctx.lineTo(0.30, 0.76)
      ctx.lineTo(0.66, 0.86)
      ctx.lineTo(0.80, 0.60)
      ctx.lineTo(0.56, 0.50)
      ctx.lineTo(0.43, 0.56)
      ctx.lineTo(0.43, -0.90)
      ctx.lineTo(-0.43, -0.90)
      ctx.lineTo(-0.43, 0.56)
      ctx.lineTo(-0.56, 0.50)
      ctx.lineTo(-0.80, 0.60)
      ctx.lineTo(-0.66, 0.86)
      ctx.lineTo(-0.30, 0.76)
      ctx.closePath()
    } else {
      ctx.rect(-0.48, -0.80, 0.96, 1.58)
    }

    ctx.fillStyle = design.gc
    ctx.fill()
    ctx.restore()

    if (stamp) {
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(cx, cy - H * 0.28, W * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = stamp.p
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }, [design])

  return <canvas ref={canvasRef} width={160} height={200} className="w-full h-auto block" />
}

export function MyDesignsPage({
  savedDesigns,
  setSavedDesigns,
  setSelectedStamp,
  setPage,
}: MyDesignsPageProps) {
  const remove = (id: number) => {
    setSavedDesigns(savedDesigns.filter((d) => d.id !== id))
  }

  const load = (d: Design) => {
    const stamp = STAMPS.find((s) => s.id === d.stampId)
    if (stamp) setSelectedStamp(stamp)
    setPage('viewer')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-5 border-b border-border flex-shrink-0">
        <div className="font-serif text-[26px] font-light tracking-[0.06em]">
          Mis <span className="text-gold italic">Diseños</span>
        </div>
        <div className="text-[11px] text-text-dim mt-1 tracking-[0.04em]">
          {savedDesigns.length} diseños guardados
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {savedDesigns.length === 0 ? (
          <div className="text-center pt-20 opacity-40">
            <div className="font-serif text-[28px] font-light tracking-[0.1em] text-gold">Vacío</div>
            <div className="text-[11px] tracking-[0.1em] uppercase text-text-dim mt-2">
              Guardá diseños desde el visor
            </div>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {savedDesigns.map((d) => {
              const stamp = STAMPS.find((s) => s.id === d.stampId)
              const garment = GARMENTS.find((g) => g.id === d.garment)

              return (
                <div key={d.id} className="bg-surface border border-border overflow-hidden">
                  <div className="bg-[#0e0d0c] overflow-hidden relative">
                    <DesignThumb design={d} />
                    <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                      <button
                        onClick={() => load(d)}
                        title="Editar"
                        className="w-7 h-7 bg-[rgba(10,9,8,0.88)] border border-border-b text-gold text-sm flex items-center justify-center cursor-pointer rounded-sm"
                      >
                        ✏
                      </button>
                      <button
                        onClick={() => remove(d.id)}
                        title="Eliminar"
                        className="w-7 h-7 bg-[rgba(10,9,8,0.88)] border border-border-b text-text-dim text-sm flex items-center justify-center cursor-pointer rounded-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="p-3 border-t border-border">
                    <div className="text-xs tracking-[0.02em] mb-1">{d.name}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-text-dim tracking-[0.06em] uppercase">
                        {garment?.label}
                      </span>
                      <span className="text-[10px] text-text-dim">{d.at}</span>
                    </div>
                    {stamp && (
                      <div className="text-[10px] text-gold mt-1">
                        {stamp.name} · ${(stamp.price / 100).toFixed(0)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}