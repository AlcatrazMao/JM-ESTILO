import { useState, useRef, useEffect } from 'react'
import { Stamp } from '../lib/data'

interface StampThumbProps {
  stamp: Stamp
  size?: number
}

export function StampThumb({ stamp, size = 80 }: StampThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = size / 2
    const cy = size / 2
    const r = size * 0.38

    ctx.clearRect(0, 0, size, size)
    ctx.save()

    const { type, p, s } = stamp

    switch (type) {
      case 'geo': {
        for (let i = 0; i < 5; i++) {
          const rd = r * (0.28 + i * 0.16)
          ctx.beginPath()
          for (let j = 0; j < 6; j++) {
            const a = (j * Math.PI) / 3 - Math.PI / 6
            ctx.lineTo(cx + rd * Math.cos(a), cy + rd * Math.sin(a))
          }
          ctx.closePath()
          ctx.strokeStyle = i % 2 === 0 ? p : s
          ctx.lineWidth = size * 0.006
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.arc(cx, cy, size * 0.022, 0, Math.PI * 2)
        ctx.fillStyle = p
        ctx.fill()
        break
      }
      case 'mono': {
        ctx.font = `300 ${size * 0.52}px 'Cormorant Garamond', serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = p
        ctx.fillText('JM', cx, cy + size * 0.03)
        ctx.strokeStyle = s
        ctx.lineWidth = size * 0.004
        ctx.beginPath()
        ctx.moveTo(cx - r * 0.52, cy + r * 0.52)
        ctx.lineTo(cx + r * 0.52, cy + r * 0.52)
        ctx.stroke()
        break
      }
      case 'cross': {
        const arm = r * 0.4
        const th = size * 0.038
        ctx.fillStyle = p
        ctx.fillRect(cx - th / 2, cy - arm, th, arm * 2)
        ctx.fillRect(cx - arm, cy - th / 2, arm * 2, th)
        break
      }
      case 'sacred': {
        const cr = r * 0.36
        ctx.strokeStyle = p
        ctx.lineWidth = size * 0.004
        ctx.beginPath()
        ctx.arc(cx, cy, cr, 0, Math.PI * 2)
        ctx.stroke()
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3
          ctx.beginPath()
          ctx.arc(cx + cr * Math.cos(a), cy + cr * Math.sin(a), cr, 0, Math.PI * 2)
          ctx.stroke()
        }
        break
      }
      case 'stars': {
        ctx.fillStyle = p
        ctx.globalAlpha = 0.92
        for (let k = 0; k < 4; k++) {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate((k * Math.PI) / 2)
          ctx.beginPath()
          ctx.moveTo(0, -size * 0.08)
          ctx.lineTo(size * 0.02, -size * 0.02)
          ctx.lineTo(0, 0)
          ctx.lineTo(-size * 0.02, -size * 0.02)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }
        break
      }
      default: {
        // Default: simple circle
        ctx.beginPath()
        ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = p
        ctx.fill()
        ctx.strokeStyle = s
        ctx.lineWidth = size * 0.01
        ctx.stroke()
      }
    }

    ctx.restore()
  }, [stamp, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="block"
    />
  )
}