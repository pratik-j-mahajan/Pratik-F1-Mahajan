import { useMemo } from 'react'

// Decorative (not scannable) barcode and QR code for the pass and ticket.

// Small seeded random so the pattern is the same on every render
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function Barcode({ seed = 6, bars = 48, className }) {
  const { rects, width } = useMemo(() => {
    const r = rng(seed)
    const rects = []
    let x = 0
    for (let i = 0; i < bars; i++) {
      const w = 1 + Math.floor(r() * 3)
      if (i % 2 === 0) rects.push([x, w])
      x += w
    }
    return { rects, width: x }
  }, [seed, bars])

  return (
    <svg className={className} viewBox={`0 0 ${width} 40`} preserveAspectRatio="none" aria-hidden="true">
      {rects.map(([x, w], i) => (
        <rect key={i} x={x} y="0" width={w} height="40" fill="currentColor" />
      ))}
    </svg>
  )
}

export function QrCode({ seed = 2026, size = 25, className }) {
  const cells = useMemo(() => {
    const r = rng(seed)
    const corners = [[0, 0], [size - 7, 0], [0, size - 7]]
    const finder = (x, y) => {
      for (const [ox, oy] of corners) {
        const dx = x - ox
        const dy = y - oy
        if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
          const ring = dx === 0 || dy === 0 || dx === 6 || dy === 6
          const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
          return ring || core ? 1 : 0
        }
        // quiet zone around each finder square
        if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) return 0
      }
      return null
    }
    const out = []
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const f = finder(x, y)
        if (f === 1 || (f === null && r() > 0.52)) out.push([x, y])
      }
    }
    return out
  }, [seed, size])

  return (
    <svg className={className} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" aria-hidden="true">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  )
}
