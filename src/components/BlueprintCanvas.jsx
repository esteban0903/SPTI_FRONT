import { useEffect, useRef } from 'react'

export default function BlueprintCanvas({ points = [], width = 520, height = 360 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    const numeric = (points || []).map((p) => ({
      x: Number(p?.x ?? p?.X ?? (Array.isArray(p) ? p[0] : 0)) || 0,
      y: Number(p?.y ?? p?.Y ?? (Array.isArray(p) ? p[1] : 0)) || 0,
    }))

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of numeric) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    if (minX === Infinity) {
      minX = 0; minY = 0; maxX = 0; maxY = 0
    }
    const spanX = Math.max(0.0001, maxX - minX)
    const spanY = Math.max(0.0001, maxY - minY)

    const padding = 20
    const availW = Math.max(10, canvas.width - padding * 2)
    const availH = Math.max(10, canvas.height - padding * 2)
    const scale = Math.min(availW / spanX, availH / spanY)
    const finalScale = Number.isFinite(scale) && scale > 0 ? scale : 1

    const drawnW = spanX * finalScale
    const drawnH = spanY * finalScale
    const offsetX = padding + Math.max(0, (availW - drawnW) / 2)
    const offsetY = padding + Math.max(0, (availH - drawnH) / 2)

    const mapPoint = (p) => ({
      x: offsetX + (p.x - minX) * finalScale,
      y: offsetY + (p.y - minY) * finalScale,
    })

    if (numeric.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.beginPath()
      const p0 = mapPoint(numeric[0])
      ctx.moveTo(p0.x, p0.y)
      for (let i = 1; i < numeric.length; i++) {
        const p = mapPoint(numeric[i])
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }

    const markerRadius = Math.max(2, Math.min(6, 3 * finalScale))
    ctx.fillStyle = '#fbbf24'
    for (const p of numeric) {
      const mp = mapPoint(p)
      ctx.beginPath()
      ctx.arc(mp.x, mp.y, markerRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        background: '#0b1220',
        border: '1px solid #334155',
        borderRadius: 12,
        width: '100%',
        maxWidth: width,
      }}
    />
  )
}

