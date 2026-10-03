import { useMemo } from 'react'

/*
  Home background "looks", each a different colour story with the same broadcast vibe:
  - topo:   midnight teal with a gold rim light and circuit-like contour lines
  - carbon: carbon-fibre weave lit by a papaya-orange glow
  - sun:    deep navy with a gold sunburst and halftone dots
  - mono:   black and white, giant outlined type drifting behind, one red accent
*/
export default function StyleBackdrop({ look }) {
  return (
    <div className={`look look--${look}`} aria-hidden="true">
      {look === 'topo' && <Contours />}
      {look === 'mono' && <TypeRows />}
      <span className="look-glow" />
      <span className="look-grain" />
      <span className="look-vignette" />
    </div>
  )
}

// wobbly closed rings around a point behind the driver, like a contour map of a circuit
function Contours() {
  const paths = useMemo(() => {
    const out = []
    for (let k = 1; k <= 16; k++) {
      const r = 40 + k * 46
      let d = ''
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2
        const wob = 1 + 0.09 * Math.sin(a * 3 + k * 0.6) + 0.05 * Math.sin(a * 5 - k * 0.9) + 0.03 * Math.sin(a * 9 + k)
        const x = 800 + Math.cos(a) * r * wob * 1.35
        const y = 430 + Math.sin(a) * r * wob
        d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
      }
      out.push(d + 'Z')
    }
    return out
  }, [])
  return (
    <svg className="look-topo" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      {paths.map((d, i) => (
        <path key={i} d={d} className={i % 4 === 3 ? 'is-major' : undefined} />
      ))}
    </svg>
  )
}

const ROW = 'PRATIK MAHAJAN — 06 — PRODUCT DESIGNER — '
function TypeRows() {
  return (
    <div className="look-type">
      {[0, 1, 2, 3].map((i) => (
        <p key={i} style={{ '--i': i }}>
          <span>{ROW.repeat(4)}</span>
          <span>{ROW.repeat(4)}</span>
        </p>
      ))}
    </div>
  )
}
