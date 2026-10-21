import { useCallback, useEffect, useRef, useState } from 'react'
import { track } from '../analytics.js'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import useParallax from '../hooks/useParallax.js'
import { LiveHud, LiveTower } from '../components/home/Live.jsx'
import AuraBackdrop from '../components/home/AuraBackdrop.jsx'
import GarageBackdrop from '../components/home/GarageBackdrop.jsx'
import HyperBackdrop from '../components/home/HyperBackdrop.jsx'
import StyleBackdrop from '../components/home/StyleBackdrop.jsx'

// which background the hero uses: 'hyper' (night tunnel at race speed — floors it on START),
// 'aura' (glowing colour fields), 'garage' (pit garage drawn in code) or 'photo' (the
// original blurred gradient image)
const LOOKS = ['topo', 'carbon', 'sun', 'mono'] // StyleBackdrop looks
const HERO_BG = new URLSearchParams(window.location.search).get('bg') || 'photo'

const ease = [0.22, 1, 0.36, 1]

// How far (px) the background and 06 drift at the screen edges.
const BG_SHIFT = 18

const SPEC = [
  ['Race no.', '06'],
  ['Base', 'Pune, IN'],
  ['Discipline', 'Product & UX'],
  ['Season', '2026'],
]

// stream overlay: a REC timer counting up from when the page opened
function StreamTimer() {
  const [t, setT] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setT(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(t / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')
  return <>00:{mm}:{ss}</>
}

let mapWarmed = false
export function warmMap(priority) {
  if (mapWarmed) return
  mapWarmed = true
  const img = new Image()
  img.fetchPriority = priority
  img.decoding = 'async'
  img.src = '/images/map-day.webp'
  // decode ahead too, so the first frame of the map paints without a hitch
  img.decode?.().catch(() => {})
}

// START: the five lights come on one by one, go out — and away we go
export function useRaceStart() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [lit, setLit] = useState(0)
  const [running, setRunning] = useState(false)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const start = useCallback(() => {
    if (running) return
    track('start_race')
    if (reduce) return navigate('/map')
    setRunning(true)
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))
    // quick, like the real thing: five lights in half a second, lights out, go
    for (let i = 1; i <= 5; i++) at(i * 100, () => setLit(i))
    at(500 + 120, () => setLit(0)) // lights out
    at(500 + 220, () => navigate('/map'))
  }, [running, reduce, navigate])

  return { lit, running, start }
}

const rise = (delay) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease },
})

export default function Home() {
  const parallax = useParallax(BG_SHIFT)
  const race = useRaceStart()

  // the map is the next stop: fetch its full-quality image quietly once home has settled,
  // and again (high priority) the moment someone points at START — so it's cached by the time it opens
  useEffect(() => {
    const t = setTimeout(() => warmMap('low'), 1800)
    return () => clearTimeout(t)
  }, [])

  // Enter starts the race (the page itself doesn't scroll, so this is the way in)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter' || e.target.closest?.('a, button, input, textarea')) return
      e.preventDefault()
      race.start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [race])

  return (
    <div className="home">
      <section className="hero" onMouseMove={parallax.onMouseMove} onMouseLeave={parallax.onMouseLeave}>
        {/* a light stream HUD over the stage: corner brackets and a REC timer */}
        <div className="hero-hud" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <span className="hero-rec">
            <b /> REC <StreamTimer />
          </span>
        </div>
        <div className="hero-stage">
          {HERO_BG === 'photo' ? (
            <motion.div className="hero-bg hero-bg--code" aria-hidden="true" style={{ x: parallax.x, y: parallax.y }}>
              {/* polished red, with a slow sheen gliding across now and then */}
              <span className="hero-gloss" />
              {/* a faint telemetry speed trace across the background, like the F1 TV lap graph */}
              <svg className="hero-trace" viewBox="0 0 1600 400" preserveAspectRatio="none">
                <path className="hero-trace-grid" d="M0 100 H1600 M0 200 H1600 M0 300 H1600" />
                <path className="hero-trace-line" d="M0 100 L140 100 L170 280 L230 290 L300 120 L420 110 L450 250 L480 260 L560 130 L640 115 L680 310 L740 320 L800 160 L980 100 L1010 230 L1060 240 L1140 120 L1300 100 L1340 270 L1400 275 L1480 130 L1600 110" />
              </svg>
              <span className="hero-trace-label">Speed · km/h</span>
            </motion.div>
          ) : (
            <motion.div className={`hero-bg hero-bg--${LOOKS.includes(HERO_BG) ? 'look' : HERO_BG}`} style={{ x: parallax.x, y: parallax.y }}>
              {LOOKS.includes(HERO_BG) ? (
                <StyleBackdrop look={HERO_BG} />
              ) : HERO_BG === 'hyper' ? (
                <HyperBackdrop boost={race.running} />
              ) : HERO_BG === 'aura' ? (
                <AuraBackdrop />
              ) : (
                <GarageBackdrop />
              )}
            </motion.div>
          )}

          <motion.p
            className="hero-number"
            aria-hidden="true"
            style={{ x: parallax.x, y: parallax.y }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease }}
          >
            06
          </motion.p>

          <motion.div className="hero-driver" {...rise(0.2)}>
            <img src="/images/driver.webp" alt="Pratik Mahajan" fetchPriority="high" />
          </motion.div>

          {/* the floor: the background's own red rises across the full width over the photo's base */}
          <span className="hero-floor" aria-hidden="true" />

          <motion.div className="hero-role" {...rise(0.35)}>
            <span className="hero-kerb" aria-hidden="true" />
            <p className="hero-country">
              INDIA <img className="hero-flag" src="/images/flag-india.svg" alt="" />
            </p>
            <p className="hero-title">
              Product
              <br />
              Designer
            </p>
            <p className="hero-pitch">
              I find <b>UX problems</b> in everyday apps — and design <b>simple fixes</b> for them.
            </p>
            <p className="hero-pitch-meta">
              <span className="hero-open">
                <i aria-hidden="true" />
                <b>Available</b>
                <span>Product design roles</span>
              </span>
              <span className="hero-tags">
                <span>B.Tech CSE &rsquo;26</span>
                <span>Pune, IN</span>
              </span>
            </p>
          </motion.div>

          {/* a race quietly running: onboard readout on the left, timing tower on the right */}
          <motion.div className="hero-live-hud" {...rise(0.55)}>
            <LiveHud />
          </motion.div>
          <motion.div className="hero-live-tower" {...rise(0.6)}>
            <LiveTower />
          </motion.div>

          <motion.h1 className="hero-name" {...rise(0.5)}>
            <span>Pratik</span>
            <span>Mahajan</span>
          </motion.h1>

          {/* driver spec, in timing-screen type */}
          <motion.dl className="hero-spec" {...rise(0.45)}>
            {SPEC.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div className={`hero-card${race.running ? ' is-starting' : ''}`} {...rise(0.65)}>
            {/* start lights: they come on while you hover, and run the real sequence when you start */}
            <span className="hero-lights" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} style={{ '--i': i }} className={i < race.lit ? 'is-on' : undefined} />
              ))}
            </span>
            <Link
              to="/map"
              className="hero-start"
              aria-label="Start — open the circuit map"
              onPointerEnter={() => warmMap('high')}
              onFocus={() => warmMap('high')}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                e.preventDefault()
                race.start()
              }}
            >
              <span className="hero-card-bg" />
              <img className="hero-card-logo" src="/images/f1-logo-white-v2.svg" alt="" />
              <span className="hero-start-label">Start</span>
              <span className="sr-only"> the portfolio tour</span>
              <span className="hero-chevrons" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </Link>
            <p className="hero-key" aria-hidden="true">
              {race.running ? (
                'Lights out and away we go…'
              ) : (
                <>
                  or press <kbd>Enter ⏎</kbd>
                </>
              )}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
