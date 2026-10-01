import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import useParallax from '../hooks/useParallax.js'

const ease = [0.22, 1, 0.36, 1]

// How far (px) the background and 06 drift at the screen edges.
const BG_SHIFT = 18

const SPEC = [
  ['Race no.', '06'],
  ['Base', 'Pune, IN'],
  ['Discipline', 'Product & UX'],
  ['Season', '2026'],
]

const HINT_KEY = 'home-hint-done'
const readHintDone = () => {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}

// START: the five lights come on one by one, go out — and away we go
function useRaceStart() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [lit, setLit] = useState(0)
  const [running, setRunning] = useState(false)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const start = useCallback(() => {
    if (running) return
    try {
      localStorage.setItem(HINT_KEY, '1')
    } catch {
      /* fine */
    }
    if (reduce) return navigate('/map')
    setRunning(true)
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))
    for (let i = 1; i <= 5; i++) at(i * 200, () => setLit(i))
    at(1000 + 350, () => setLit(0)) // lights out
    at(1000 + 550, () => navigate('/map'))
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
  const [hint, setHint] = useState(false)

  // first-time visitors get a short "how this works" card after a moment
  useEffect(() => {
    if (readHintDone()) return
    const t = setTimeout(() => setHint(true), 1800)
    return () => clearTimeout(t)
  }, [])

  const closeHint = () => {
    setHint(false)
    try {
      localStorage.setItem(HINT_KEY, '1')
    } catch {
      /* fine */
    }
  }

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
        <div className="hero-stage">
          <motion.img className="hero-bg" src="/images/hero-bg-v2.webp" alt="" aria-hidden="true" style={{ x: parallax.x, y: parallax.y }} />

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
            <img src="/images/driver.webp" alt="Pratik Mahajan" />
            <div className="hero-driver-fade" />
          </motion.div>

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

          {/* first visit: a broadcast-style hint that START is the way in */}
          <AnimatePresence>
            {hint && !race.running && (
              <motion.aside
                className="hero-hint"
                initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
                aria-label="How to explore"
              >
                <span className="hero-hint-tag">
                  <i aria-hidden="true">i</i> New here?
                </span>
                <p className="hero-hint-long">
                  Press <b>Start</b> to enter the circuit — every section of my portfolio is a corner on the track.
                </p>
                <p className="hero-hint-short">
                  Tap <b>Start</b> to explore.
                </p>
                <button type="button" className="hero-hint-close" onClick={closeHint} aria-label="Dismiss">
                  ×
                </button>
              </motion.aside>
            )}
          </AnimatePresence>

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
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                e.preventDefault()
                race.start()
              }}
            >
              <span className="hero-card-bg" />
              <img className="hero-card-logo" src="/images/f1-logo-white-v2.svg" alt="" />
              <span className="hero-start-label">Start</span>
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
