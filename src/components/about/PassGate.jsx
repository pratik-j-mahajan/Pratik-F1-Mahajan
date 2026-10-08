import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion'
import { PassFront } from './VipPass.jsx'
import FlapBoard from './FlapBoard.jsx'

/*
  Paddock entry gate. The pass hangs on a cloth lanyard (left half); hover to grab it
  and it follows the cursor. Pull away more than ~1cm to the left, top or bottom and it
  lets go; moving right keeps it attached. Hold it over the scanner (right half) to enter.
*/
const LET_GO = 38 // ≈ 1cm
const SCAN_MS = 1600
const GRANTED_MS = 900
const LINES = {
  idle: 'Grab the pass and carry it to the reader.',
  held: 'Hold it flat on the reader.',
  scanning: 'Checking you’re on the list…',
  granted: 'Welcome to the paddock.',
}
const STATUS = {
  idle: 'Awaiting pass',
  held: 'Pass detected',
  scanning: 'Verifying',
  granted: 'Access granted',
}
// handwritten notes pinned around the hanging pass; `top` is % down the card
const NOTES = [
  { side: 'left', top: 30, text: 'Sunglasses stay on.', sub: 'Brand guidelines.' },
  { side: 'left', top: 84, text: 'All access*', sub: '*except meetings that could’ve been an email' },
  { side: 'right', top: 24, text: 'Lucky 06.', sub: 'Chosen by vibes, approved by nobody.' },
  { side: 'right', top: 93, text: 'Scan me.', sub: 'Faster than my Slack replies.' },
]
const LANYARD_TEXT = 'VIP PASS ✦ PADDOCK CLUB ✦ '.repeat(8)

export default function PassGate({ onGranted }) {
  const rootRef = useRef(null)
  const cardRef = useRef(null)
  const padRef = useRef(null)
  const grab = useRef(null) // pointer offset while attached
  const [size, setSize] = useState({ w: 1280, h: 800 })
  const [phase, setPhase] = useState('idle') // idle | held | scanning | granted
  const [waveAt, setWaveAt] = useState(null) // where the "access granted" wave starts
  const now = useClock()

  // the hanging sign drifts a touch with the mouse
  const mx = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 60, damping: 18 })
  const signX = useTransform(px, (v) => v * 6)

  // clip point of the pass (top centre), sprung toward its target
  const targetX = useMotionValue(320)
  const targetY = useMotionValue(200)
  const x = useSpring(targetX, { stiffness: 130, damping: 13, mass: 0.9 })
  const y = useSpring(targetY, { stiffness: 130, damping: 13, mass: 0.9 })
  const vx = useVelocity(x)
  const rotate = useSpring(useTransform(vx, [-2000, 2000], [14, -14]), { stiffness: 120, damping: 14 })
  // the hook has a life of its own: it lags and wobbles on its pivot, and spins on the swivel
  const hookSwing = useSpring(useTransform(vx, [-2000, 2000], [6, -6]), { stiffness: 80, damping: 6, mass: 0.7 })
  const hookSpin = useSpring(useTransform(vx, [-1600, 1600], [-50, 50]), { stiffness: 55, damping: 5, mass: 0.6 })

  // phones: hang the pass on the left so it clears the scanner on the right
  const anchorX = size.w * (size.w < 560 ? 0.3 : size.w < 800 ? 0.4 : 0.25)
  const rest = () => ({ x: anchorX, y: Math.max(150, size.h * 0.2) })

  useLayoutEffect(() => {
    const measure = () => {
      const r = rootRef.current.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // (re)hang at rest when the screen size changes
  useEffect(() => {
    if (phase !== 'idle') return
    const r = rest()
    targetX.set(r.x)
    targetY.set(r.y)
  }, [size.w, size.h])

  // drop in from above on first load
  useEffect(() => {
    const r = rest()
    x.jump(r.x)
    y.jump(-400)
    targetX.set(r.x)
    targetY.set(r.y)
  }, [])

  const letGo = () => {
    grab.current = null
    const r = rest()
    targetX.set(r.x)
    targetY.set(r.y)
    setPhase('idle')
  }

  const startScan = () => {
    grab.current = null
    const pad = padRef.current.getBoundingClientRect()
    const card = cardRef.current.getBoundingClientRect()
    const root = rootRef.current.getBoundingClientRect()
    // snap the pass so its lower part (barcode) sits on the reader
    const offset = card.top - root.top - y.get()
    const padCy = pad.top + pad.height / 2 - root.top
    targetX.set(pad.left + pad.width / 2 - root.left)
    targetY.set(padCy - offset - card.height * 0.78)
    setPhase('scanning')
    setTimeout(() => {
      const p = padRef.current?.getBoundingClientRect()
      const r = rootRef.current?.getBoundingClientRect()
      if (p && r) setWaveAt({ x: p.left + p.width / 2 - r.left, y: p.top + p.height / 2 - r.top })
      setPhase('granted')
    }, SCAN_MS)
    setTimeout(onGranted, SCAN_MS + GRANTED_MS)
  }

  const onPointerMove = (e) => {
    if (size.w) {
      mx.set(e.clientX / size.w - 0.5)
    }
    if (phase === 'scanning' || phase === 'granted') return
    const root = rootRef.current.getBoundingClientRect()
    const px = e.clientX - root.left
    const py = e.clientY - root.top
    const card = cardRef.current.getBoundingClientRect()
    const cl = card.left - root.left
    const ct = card.top - root.top
    const cr = card.right - root.left
    const cb = card.bottom - root.top

    if (!grab.current) {
      if (px >= cl && px <= cr && py >= ct && py <= cb) {
        grab.current = { dx: px - x.get(), dy: py - y.get() }
        setPhase('held')
      }
      return
    }

    // left / top / bottom: let go past ~1cm. Right: stays attached.
    if (px < cl - LET_GO || py < ct - LET_GO || py > cb + LET_GO) {
      letGo()
      return
    }

    targetX.set(px - grab.current.dx)
    targetY.set(Math.min(size.h - 120, Math.max(60, py - grab.current.dy)))

  }

  // The pass trails the cursor, so keep checking while it's held (not only on mouse moves)
  useEffect(() => {
    if (phase !== 'held') return
    const t = setInterval(() => {
      const pad = padRef.current.getBoundingClientRect()
      const card = cardRef.current.getBoundingClientRect()
      // any real overlap between the pass and the reader glass counts
      const overlapX = Math.min(card.right, pad.right + 30) - Math.max(card.left, pad.left - 30)
      const overlapY = Math.min(card.bottom, pad.bottom + 30) - Math.max(card.top, pad.top - 30)
      if (overlapX > 40 && overlapY > 20) startScan()
    }, 80)
    return () => clearInterval(t)
  })

  // lanyard: one broad matte ribbon hanging from above the screen down to the clip
  const ribbon = useTransform([x, y], ([cx, cy]) => {
    // the top end slides along an overhead rail, so the ribbon stays mostly upright
    const top = anchorX + (cx - anchorX) * 0.7
    return `M ${top} -80 C ${top} ${cy * 0.35} ${cx} ${cy * 0.55} ${cx} ${cy - 165}`
  })
  const cardX = useTransform(x, (v) => v)
  const scanning = phase === 'scanning'
  const granted = phase === 'granted'

  return (
    <div
      ref={rootRef}
      className={`gate is-${phase}`}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerMove}
      onPointerLeave={() => grab.current && letGo()}
    >
      {/* ---------- lanyard ---------- */}
      <svg className="gate-lanyard" width={size.w} height={size.h} aria-hidden="true">
        <defs>
          <filter id="ribbon-shadow" x="-30%" y="-10%" width="160%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.25" />
          </filter>
        </defs>
        <g filter="url(#ribbon-shadow)">
          <motion.path d={ribbon} id="ribbon" className="ribbon-edge" />
          <motion.path d={ribbon} className="ribbon-face" />
          <text className="ribbon-text" dy="4">
            <textPath href="#ribbon" startOffset="2%">
              {LANYARD_TEXT}
            </textPath>
          </text>
        </g>
      </svg>

      {/* ---------- the pass ---------- */}
      <motion.div className="gate-pass" style={{ x: cardX, y, rotate }}>
        <div className="gate-hardware" aria-hidden="true">
          <SnapHook swing={hookSwing} spin={hookSpin} />
        </div>
        <div ref={cardRef} className="pass-holder gate-holder">
          <span className="gate-slot" aria-hidden="true" />
          <div className="pass-flip">
            <PassFront />
          </div>
          <span className="gate-matte" aria-hidden="true" />
          <GateNotes show={phase === 'idle'} />
          {scanning && <span className="gate-beam" aria-hidden="true" />}
        </div>
      </motion.div>

      {/* ---------- backdrop ---------- */}
      <div className="gate-scene" aria-hidden="true">
        {/* big outlined lettering on the back wall, standing on the floor line */}
        <p className="gate-wall">Paddock</p>
        <span className="gate-horizon" />
        <svg className="gate-hint" viewBox="0 0 200 60" preserveAspectRatio="none">
          <path d="M4 50 C60 8 140 8 196 30" />
        </svg>
        <p className="gate-foot gate-foot--left">
          <i className="gate-live" /> Paddock open · Local {now}
        </p>
        <p className="gate-foot gate-foot--right">Security level · mostly vibes</p>
      </div>

      {/* ---------- access granted wave ---------- */}
      {granted && waveAt && (
        <>
          <motion.span
            className="gate-wave"
            style={{ left: waveAt.x, top: waveAt.y }}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.2, 0.7, 0.3, 1] }}
          />
          <motion.p
            className="gate-granted"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>✓</span> Access granted — welcome to the paddock
          </motion.p>
        </>
      )}

      {/* ---------- scanner station + guide ---------- */}
      <div className="gate-right">
        <div className="gate-station">
          <motion.div className="gate-overhead" style={{ x: signX }} aria-hidden="true">
            <span className="gate-overhead-cable gate-overhead-cable--l" />
            <span className="gate-overhead-cable gate-overhead-cable--r" />
            <div className="gate-overhead-board">
              <div className="gate-overhead-head">
              <svg viewBox="0 0 24 24" className="gate-overhead-arrow">
                <path d="M12 4v15M6 13l6 6 6-6" />
              </svg>
              <span className="gate-overhead-num">06</span>
              <span className="gate-overhead-text">
                Gate
                <small>Paddock Club</small>
              </span>
              <span className="gate-overhead-live">
                <i /> Live
              </span>
              </div>
              <FlapBoard />
            </div>
          </motion.div>
        <div className={`pillar${scanning ? ' is-scanning' : ''}${granted ? ' is-granted' : ''}${phase === 'held' ? ' is-held' : ''}`}>
            <div className="pillar-head">
              <div className="pillar-glass">
                <div className="pillar-screen">
                  <p className="pillar-status">
                    {granted ? 'Welcome' : scanning ? 'Reading…' : phase === 'held' ? 'Hold here' : 'Tap pass'}
                  </p>
                  <ScreenIcon state={granted ? 'ok' : scanning ? 'busy' : 'down'} />
                </div>
                <div ref={padRef} className="pillar-reader">
                  <ContactlessIcon />
                  <span className="pillar-laser" />
                </div>
                <span className="pillar-dots">
                  {Array.from({ length: 6 }, (_, i) => (
                    <i key={i} style={{ '--i': i }} />
                  ))}
                </span>
              </div>
            </div>
            <div className="pillar-body">
              <div className="pillar-signal">
                <LedSign granted={granted} />
              </div>
              <span className="pillar-label">Gate 06</span>
              <img className="pillar-logo" src="/images/f1-logo-red.svg" alt="" />
            </div>
            <span className="pillar-foot" />
          </div>
          <span className={`gate-spot is-${phase}`} aria-hidden="true" />
        </div>

        <div className="gate-guide">
          <p className={`gate-chip is-${phase}`}>
            <i />
            {STATUS[phase]}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={phase}
              className="gate-line"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {LINES[phase]}
            </motion.p>
          </AnimatePresence>
          <button type="button" className="gate-skip" onClick={onGranted}>
            Skip the scan <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// The notes draw in one by one once the pass has dropped in and settled, and step
// aside while the pass is being carried or scanned.
function GateNotes({ show }) {
  return (
    <motion.div
      className="gate-notes"
      aria-hidden="true"
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: show ? 0.4 : 0.15 }}
    >
      {NOTES.map((n, i) => {
        const delay = 0.45 + i * 0.12
        return (
          <div key={i} className={`gate-note is-${n.side}`} style={{ top: `${n.top}%` }}>
            <svg className="gate-note-arrow" viewBox="0 0 70 40">
              <motion.path
                d="M3 8 C 22 2, 44 6, 62 28"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, delay, ease: [0.6, 0, 0.3, 1] }}
              />
              <motion.path
                d="M52 27 L63 29 L61 18"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.18, delay: delay + 0.3 }}
              />
            </svg>
            <motion.p
              className="gate-note-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: delay + 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {n.text}
              <small>{n.sub}</small>
            </motion.p>
          </div>
        )
      })}
    </motion.div>
  )
}

// polished steel: cylindrical shading (dark rim, bright core, soft falloff)
function SteelDefs() {
  return (
    <defs>
      <linearGradient id="steel" x1="0" x2="1">
        <stop offset="0" stopColor="#34373c" />
        <stop offset="0.14" stopColor="#80868e" />
        <stop offset="0.34" stopColor="#e6e9ec" />
        <stop offset="0.42" stopColor="#ffffff" />
        <stop offset="0.58" stopColor="#a9afb6" />
        <stop offset="0.8" stopColor="#62676f" />
        <stop offset="1" stopColor="#2c2f34" />
      </linearGradient>
      <linearGradient id="steel-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f6f8" />
        <stop offset="0.45" stopColor="#a4aab1" />
        <stop offset="1" stopColor="#4a4e55" />
      </linearGradient>
      <linearGradient id="strap-fold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d10a1f" />
        <stop offset="0.78" stopColor="#c4091c" />
        <stop offset="1" stopColor="#8a0614" />
      </linearGradient>
      <clipPath id="hook-through">
        {/* below this line the hook is behind the card, through the slot */}
        <rect x="0" y="0" width="140" height="213" />
      </clipPath>
    </defs>
  )
}

// Red strap wrapped round a steel D-ring; swivel + snap hook below move on their own
function SnapHook({ swing, spin }) {
  return (
    <div className="snap-hook">
      {/* fixed part: D-ring + strap end */}
      <svg viewBox="0 0 140 220" width="140" height="220">
        <SteelDefs />
        {/* D-ring loop */}
        <path d="M37 62 H103 C103 88 90 104 70 104 C50 104 37 88 37 62" fill="none" stroke="#25282c" strokeWidth="7.5" strokeLinecap="round" />
        <path d="M37 62 H103 C103 88 90 104 70 104 C50 104 37 88 37 62" fill="none" stroke="url(#steel-v)" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M41 70 C44 88 55 99 70 100" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" strokeLinecap="round" />
        {/* strap end folded round the bar — bar tips peek out both sides */}
        <path d="M42 0 H98 V58 Q98 70 86 70 H54 Q42 70 42 58 Z" fill="url(#strap-fold)" />
        <path d="M42 12 H98" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <path d="M42 13.2 H98" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        <path d="M42 50 H98" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      </svg>

      {/* moving part: swivel eye, head, barrel and snap hook */}
      <motion.div className="snap-hook-swing" style={{ rotate: swing }}>
        <motion.div className="snap-hook-spin" style={{ rotateY: spin }}>
          <svg viewBox="0 0 140 220" width="140" height="220">
            <SteelDefs />
            {/* eye through the D-ring */}
            <ellipse cx="70" cy="106" rx="6.5" ry="6" fill="none" stroke="#25282c" strokeWidth="5" />
            <ellipse cx="70" cy="106" rx="6.5" ry="6" fill="none" stroke="url(#steel)" strokeWidth="3.4" />
            {/* swivel head, neck, barrel, collar */}
            <rect x="61" y="112" width="18" height="7" rx="3.5" fill="url(#steel)" stroke="#2b2e33" strokeWidth="0.8" />
            <rect x="66.5" y="118.5" width="7" height="5" fill="#3a3e44" />
            <rect x="59" y="123" width="22" height="17" rx="5.5" fill="url(#steel)" stroke="#2b2e33" strokeWidth="0.8" />
            <path d="M62 126 V137" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="57.5" y="139.5" width="25" height="4.5" rx="2.2" fill="#50555c" />
            {/* hook body */}
            <path d="M59 144 H81 L79.5 170 H60.5 Z" fill="url(#steel)" stroke="#2b2e33" strokeWidth="0.8" strokeLinejoin="round" />
            <path d="M63 147 L63.6 167" stroke="rgba(255,255,255,0.7)" strokeWidth="1.1" strokeLinecap="round" />
            {/* trigger lever */}
            <path d="M80 151 H87 Q89.5 151 89.5 153.5 Q89.5 156 87 156 H80 Z" fill="url(#steel-v)" stroke="#2b2e33" strokeWidth="0.8" />
            <g clipPath="url(#hook-through)">
              {/* hook: goes down and into the slot */}
              <path d="M76 168 L79.5 198 Q82 218 68 218 Q55 218 57.5 203" fill="none" stroke="#25282c" strokeWidth="8" strokeLinecap="round" />
              <path d="M76 168 L79.5 198 Q82 218 68 218 Q55 218 57.5 203" fill="none" stroke="url(#steel)" strokeWidth="6" strokeLinecap="round" />
              <path d="M77.3 172 L80 197" stroke="rgba(255,255,255,0.75)" strokeWidth="1.1" strokeLinecap="round" />
              {/* spring gate */}
              <path d="M64 169 L58 201" stroke="#25282c" strokeWidth="5.4" strokeLinecap="round" />
              <path d="M64 169 L58 201" stroke="url(#steel-v)" strokeWidth="3.6" strokeLinecap="round" />
            </g>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}

function ScreenIcon({ state }) {
  return (
    <svg viewBox="0 0 24 24" className={`pillar-screen-icon is-${state}`} aria-hidden="true">
      {state === 'ok' ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : state === 'busy' ? <circle cx="12" cy="12" r="7" /> : <path d="M12 4v15M6 13l6 6 6-6" />}
    </svg>
  )
}

function ContactlessIcon() {
  return (
    <svg viewBox="0 0 64 40" className="pillar-nfc" aria-hidden="true">
      <ellipse cx="32" cy="20" rx="29" ry="17" />
      <path d="M22 13c3 4 3 10 0 14M28 10c4.5 6 4.5 14 0 20M34 7c6 8 6 18 0 26" />
    </svg>
  )
}

// LED dot-matrix sign: red cross while waiting, green arrow once through
function LedSign({ granted }) {
  return (
    <svg viewBox="0 0 60 60" className={`pillar-led${granted ? ' is-go' : ''}`} aria-hidden="true">
      <defs>
        <pattern id="led-dots" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.35" fill="currentColor" />
        </pattern>
        <mask id="led-shape">
          {granted ? (
            <path d="M40 16 L20 36 M20 22 V38 H36" stroke="#fff" strokeWidth="7" strokeLinecap="square" fill="none" />
          ) : (
            <path d="M19 19 L41 41 M41 19 L19 41" stroke="#fff" strokeWidth="7" strokeLinecap="square" fill="none" />
          )}
        </mask>
      </defs>
      <rect width="60" height="60" fill="url(#led-dots)" className="pillar-led-off" />
      <rect width="60" height="60" fill="url(#led-dots)" mask="url(#led-shape)" className="pillar-led-on" />
    </svg>
  )
}

function useClock() {
  const read = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const [time, setTime] = useState(read)
  useEffect(() => {
    const t = setInterval(() => setTime(read()), 10000)
    return () => clearInterval(t)
  }, [])
  return time
}
