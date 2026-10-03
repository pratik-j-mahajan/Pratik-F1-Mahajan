import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/*
  A race quietly running behind the home page: an onboard readout (speed, gear, DRS,
  throttle/brake) and a three-car timing tower. Everything — including the live strip in
  the top bar — reads the same lap clock and the same race story, so they never disagree:
  MAH starts P2 behind VER, chases him down, and takes the lead at the end of the lap
  (or the moment the top bar's "Overtake" graphic airs, whichever comes first).
*/
const LAP_MS = 14000
const TOTAL_LAPS = 58
const FIRST_LAP = 41 + Math.floor(Math.random() * 6)
const T0 = typeof performance !== 'undefined' ? performance.now() : 0

// where the corners are on the lap (0–1), and the slowest speed through each
const CORNERS = [
  { at: 0.12, v: 92, w: 0.06 },
  { at: 0.3, v: 168, w: 0.05 },
  { at: 0.46, v: 121, w: 0.06 },
  { at: 0.63, v: 214, w: 0.04 },
  { at: 0.78, v: 84, w: 0.07 },
]
const V_MAX = 324
const DRS_ZONE = [0.86, 1.06] // main straight, wraps past the line

const smooth = (x) => x * x * (3 - 2 * x)

export function speedAt(p) {
  let v = V_MAX
  for (const c of CORNERS) {
    // distance to the corner, wrapping round the lap
    const d = Math.min(Math.abs(p - c.at), 1 - Math.abs(p - c.at))
    if (d < c.w * 2.4) v = Math.min(v, c.v + (V_MAX - c.v) * smooth(Math.min(1, d / (c.w * 2.4))))
  }
  return v
}

let overtaken = false
export function markOvertake() {
  overtaken = true
}

export function lapClock() {
  const t = (performance.now() - T0) / LAP_MS
  const lap = Math.min(TOTAL_LAPS, FIRST_LAP + Math.floor(t))
  const mahLeads = overtaken || lap > FIRST_LAP
  return { p: t % 1, lap, mahLeads, order: mahLeads ? ['MAH', 'VER', 'NOR'] : ['VER', 'MAH', 'NOR'] }
}

function useTick(ms) {
  const reduce = useReducedMotion()
  const [, setN] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setN((n) => n + 1), ms)
    return () => clearInterval(id)
  }, [ms, reduce])
}

export function LiveHud() {
  useTick(90)
  const { p } = lapClock()
  const v = speedAt(p)
  const ahead = speedAt((p + 0.004) % 1)
  const braking = ahead < v - 1.2
  const throttle = braking ? 0 : Math.min(1, 0.55 + (V_MAX - v) / 260 + (ahead > v ? 0.3 : 0))
  const gear = Math.max(1, Math.min(8, Math.ceil(v / 41)))
  const drs = (p > DRS_ZONE[0] || p < DRS_ZONE[1] - 1) && v > 280

  return (
    <div className="race-hud" aria-hidden="true">
      <p className="race-hud-tag">
        <i /> Onboard · MAH
      </p>
      <div className="race-hud-row">
        <p className="race-hud-speed">
          {Math.round(v)}
          <small>km/h</small>
        </p>
        <p className="race-hud-gear">
          {gear}
          <small>Gear</small>
        </p>
        <p className={`race-hud-drs${drs ? ' is-on' : ''}`}>DRS</p>
      </div>
      <div className="race-hud-pedals">
        <span className="is-throttle">
          <i style={{ scale: `${throttle} 1` }} />
        </span>
        <span className="is-brake">
          <i style={{ scale: `${braking ? 1 : 0} 1` }} />
        </span>
      </div>
    </div>
  )
}

const TEAM = { MAH: '#e10600', VER: '#3671c6', NOR: '#ff8000' }

export function LiveTower() {
  useTick(1000)
  const { p, lap, mahLeads, order } = lapClock()
  const wobble = (seed) => Math.sin(p * Math.PI * 2 + seed) * 0.15
  // before the pass MAH is closing in on VER; after it, he pulls away
  const gaps = mahLeads ? [0, 0.9 + p * 0.6 + wobble(1), 3.1 + wobble(2.4)] : [0, 0.9 - p * 0.75 + wobble(1) * 0.3, 2.9 + wobble(2.4)]
  // just after taking the lead / crossing the line: fastest lap
  const purple = mahLeads && p < 0.2

  return (
    <div className="race-tower" aria-hidden="true">
      <p className="race-tower-head">
        <span>
          <i /> Live
        </span>
        Lap {lap}/{TOTAL_LAPS}
      </p>
      <ol>
        {order.map((code, i) => (
          <motion.li key={code} layout transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }} className={code === 'MAH' ? 'is-me' : undefined}>
            <span className="race-pos">{i + 1}</span>
            <span className="race-team" style={{ background: TEAM[code] }} />
            <span className="race-code">{code}</span>
            <span className={`race-gap${code === 'MAH' && purple ? ' is-purple' : ''}`}>
              {code === 'MAH' && purple ? 'Fastest lap' : i === 0 ? 'Leader' : `+${Math.max(0.12, gaps[i]).toFixed(3)}`}
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
