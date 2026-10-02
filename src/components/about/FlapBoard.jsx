import { useEffect, useState } from 'react'

/*
  Split-flap rows for the overhead gate board. Every few seconds the board flips to the next
  page; each character that changes flips over on its own, left to right.
*/
const PAGES = [
  [
    ['Driver', 'Pratik Mahajan'],
    ['Team', 'Product Design'],
  ],
  [
    ['Base', 'Pune · India'],
    ['Focus', 'UX · UI · Visual'],
  ],
  [
    ['Reach', '1M+ impressions'],
    ['Status', 'Gate open'],
  ],
]
const WIDTH = 15 // characters per value
const EVERY = 3600

const pad = (s) => s.toUpperCase().padEnd(WIDTH, ' ').slice(0, WIDTH)

export default function FlapBoard() {
  const [page, setPage] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setPage((p) => (p + 1) % PAGES.length), EVERY)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flap" aria-label={PAGES.flat().map(([k, v]) => `${k}: ${v}`).join(', ')}>
      {PAGES[page].map(([label, value], row) => (
        <div key={row} className="flap-row" aria-hidden="true">
          <span key={`${page}-${row}`} className="flap-label">
            {label}
          </span>
          <span className="flap-cells">
            {[...pad(value)].map((ch, i) => (
              // the key changes with the character, so a new tile mounts and plays its flip
              <span key={`${i}-${ch}`} className="flap-cell" style={{ '--d': `${row * 90 + i * 28}ms` }}>
                {ch}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
