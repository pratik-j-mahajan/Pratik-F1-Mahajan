import { useMemo } from 'react'

/*
  Home background: a pit garage at night, drawn in code. Long LED strips run along the
  ceiling toward a vanishing point behind the driver, the glossy floor mirrors them, and
  faint light trails slide past like cars on the pit straight. Brand red and navy glow
  over the top so it still sits in the site's palette.
*/
const W = 1600
const H = 1000
const VP = { x: 800, y: 470 } // vanishing point, just behind the driver's shoulders
const F = 780 // focal length
const CEIL = 2.3 // ceiling height above eye level
const FLOOR = 1.5 // floor depth below eye level

const project = (x, y, z) => [VP.x + (F * x) / z, VP.y - (F * y) / z]
const quad = (pts) => pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')

// a strip lying on a horizontal plane at height y, from depth z0 to z1, between x0 and x1
const strip = (x0, x1, y, z0, z1) => quad([project(x0, y, z0), project(x1, y, z0), project(x1, y, z1), project(x0, y, z1)])

const LIGHTS = [-3.4, -1.15, 1.15, 3.4]
// LED panels along each strip, with gaps between them (near → far)
const PANELS = [
  [1.9, 2.6],
  [2.9, 3.8],
  [4.2, 5.6],
  [6.2, 8.4],
  [9.3, 13],
  [14.5, 22],
]
const WALL = 7.4 // side walls, either side of the garage
// a plane standing upright at x, between heights y0–y1 and depths z0–z1
const wall = (x, y0, y1, z0, z1) => quad([project(x, y0, z0), project(x, y1, z0), project(x, y1, z1), project(x, y0, z1)])

export default function GarageBackdrop() {
  const geo = useMemo(() => {
    const lights = LIGHTS.flatMap((x) => PANELS.map(([z0, z1]) => strip(x - 0.14, x + 0.14, CEIL, z0, z1)))
    // floor reflections of the same panels, mirrored below eye level
    const glints = LIGHTS.flatMap((x) => PANELS.map(([z0, z1]) => strip(x - 0.2, x + 0.2, -FLOOR, z0, z1)))
    // side walls: a dark face, panel seams (only the near ones, off to the sides), and a red
    // team stripe running into the distance
    const walls = [-WALL, WALL].map((x) => wall(x, -FLOOR, CEIL, 1.2, 40))
    const stripes = [-WALL, WALL].map((x) => wall(x, -1.18, -1.06, 1.2, 40))
    const seams = [-WALL, WALL].flatMap((x) => [1.6, 2.2, 3.1, 4.4].map((z) => [project(x, -FLOOR, z), project(x, CEIL, z)]))
    // lane lines on the floor and cross markings (the pit box)
    const lanes = [-5.5, -2.3, 2.3, 5.5].map((x) => [project(x, -FLOOR, 1), project(x, -FLOOR, 40)])
    const cross = [2.2, 3.4, 5.6, 9.5].map((z) => [project(-5.5, -FLOOR, z), project(5.5, -FLOOR, z)])
    // ceiling beams crossing the lights
    const beams = [1.6, 2.4, 3.6, 5.6, 9, 15].map((z) => [project(-7, CEIL, z), project(7, CEIL, z)])
    return { lights, glints, lanes, cross, beams, walls, stripes, seams }
  }, [])

  return (
    <div className="garage" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#ffd9d6" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="g-glint" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ff5a4e" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ff5a4e" stopOpacity="0" />
          </linearGradient>
          <filter id="g-bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="g-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          {/* fade everything into the distance */}
          <radialGradient id="g-haze" cx={VP.x / W} cy={VP.y / H} r="0.55">
            <stop offset="0" stopColor="#1a0d16" stopOpacity="1" />
            <stop offset="0.35" stopColor="#1a0d16" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1a0d16" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* side walls with panel seams and the team stripe */}
        <g>
          {geo.walls.map((d, i) => (
            <polygon key={i} points={d} fill="rgba(255,255,255,0.025)" />
          ))}
        </g>
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.5">
          {geo.seams.map(([a, b], i) => (
            <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
          ))}
        </g>
        <g filter="url(#g-soft)" opacity="0.45">
          {geo.stripes.map((d, i) => (
            <polygon key={i} points={d} fill="#e10600" />
          ))}
        </g>
        <g opacity="0.55">
          {geo.stripes.map((d, i) => (
            <polygon key={i} points={d} fill="#e10600" />
          ))}
        </g>

        {/* ceiling beams */}
        <g stroke="rgba(255,255,255,0.05)" strokeWidth="2">
          {geo.beams.map(([a, b], i) => (
            <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
          ))}
        </g>

        {/* LED strips: a wide bloom behind, the hard strip on top */}
        <g filter="url(#g-bloom)" opacity="0.55">
          {geo.lights.map((d, i) => (
            <polygon key={i} points={d} fill="#ff4a3d" />
          ))}
        </g>
        <g>
          {geo.lights.map((d, i) => (
            <polygon key={i} points={d} fill="url(#g-light)" />
          ))}
        </g>

        {/* glossy floor */}
        <g filter="url(#g-soft)">
          {geo.glints.map((d, i) => (
            <polygon key={i} points={d} fill="url(#g-glint)" />
          ))}
        </g>
        <g stroke="rgba(255,255,255,0.09)" strokeWidth="1.5">
          {geo.lanes.map(([a, b], i) => (
            <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
          ))}
        </g>
        <g stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="14 18">
          {geo.cross.map(([a, b], i) => (
            <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
          ))}
        </g>

        <rect width={W} height={H} fill="url(#g-haze)" />
      </svg>

      {/* light trails sliding along the pit straight, far behind the driver */}
      <span className="garage-trails">
        <i style={{ '--y': '47%', '--d': '0s', '--t': '5.5s' }} />
        <i style={{ '--y': '49.5%', '--d': '2.2s', '--t': '7s' }} />
        <i style={{ '--y': '45.5%', '--d': '4.1s', '--t': '6.2s' }} />
      </span>
      <span className="garage-tint" />
      <span className="garage-grain" />
    </div>
  )
}
