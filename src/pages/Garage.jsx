import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import GarageScene from '../components/garage/GarageScene.jsx'
import '../styles/garage.css'

/*
  3D garage walk-around between Home and the map.
  Each scroll (wheel / swipe / arrow keys) swings the camera to the next stop
  around the car (see CAMERA_STOPS in GarageScene); the last one dives into the
  back of the car and opens the map.
*/
const STAGES = [
  { label: 'Garage 06', title: 'Meet the RB-06', text: 'Built from design, code and a lot of late-night laps.' },
  { label: 'Front wing', title: 'Precision first', text: 'Every product starts with the details you notice first.' },
  { label: 'Cockpit', title: 'Driven by users', text: 'Research and empathy steer every decision I make.' },
  { label: 'Rear wing', title: 'Power & polish', text: 'Front-end craft and motion that push the design over the line.' },
  { label: 'Lights out', title: 'Into the circuit', text: 'Heading out to the track…' },
]

const SPECS = [
  ['Chassis', 'Product Design'],
  ['Power unit', 'React · Front-end'],
  ['Aero', 'Motion & Visual'],
  ['Driver', 'Pratik Mahajan #06'],
]

const LAST = STAGES.length - 1
const LOCK_MS = 1200

export default function Garage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState(0)
  const [ready, setReady] = useState(false)
  const lockRef = useRef(false)
  const wheelRef = useRef(0)
  const touchRef = useRef(null)

  const go = useCallback((dir) => {
    if (lockRef.current) return
    setStage((s) => {
      const next = Math.min(LAST, Math.max(0, s + dir))
      if (next !== s) {
        lockRef.current = true
        setTimeout(() => (lockRef.current = false), LOCK_MS)
      }
      return next
    })
  }, [])

  // Final stage: finish the dive, then open the map
  useEffect(() => {
    if (stage !== LAST) return
    const t = setTimeout(() => navigate('/map'), 1900)
    return () => clearTimeout(t)
  }, [stage, navigate])

  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault()
      if (lockRef.current) return
      wheelRef.current += e.deltaY
      if (Math.abs(wheelRef.current) > 40) {
        go(wheelRef.current > 0 ? 1 : -1)
        wheelRef.current = 0
      }
    }
    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) go(1)
      if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) go(-1)
    }
    const onTouchStart = (e) => (touchRef.current = e.touches[0].clientY)
    const onTouchEnd = (e) => {
      if (touchRef.current == null) return
      const dy = touchRef.current - e.changedTouches[0].clientY
      if (Math.abs(dy) > 45) go(dy > 0 ? 1 : -1)
      touchRef.current = null
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [go])

  const s = STAGES[stage]
  const diving = stage === LAST

  return (
    <section className="garage" aria-label="Garage">
      <div className="garage-canvas">
        <GarageScene stage={stage} onReady={() => setReady(true)} />
      </div>

      <div className="garage-vignette" />

      {/* Info panel */}
      <motion.aside
        className="garage-info"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: diving ? 0 : 1, x: 0 }}
        transition={{ duration: 0.8, delay: diving ? 0 : 1.3 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <p className="garage-info-label">
              <span>{String(stage + 1).padStart(2, '0')}</span> {s.label}
            </p>
            <h1 className="garage-info-title">{s.title}</h1>
            <p className="garage-info-text">{s.text}</p>
          </motion.div>
        </AnimatePresence>
        <dl className="garage-specs">
          {SPECS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </motion.aside>

      {/* Scroll hint + progress */}
      <motion.div
        className="garage-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: diving ? 0 : 1 }}
        transition={{ duration: 0.8, delay: diving ? 0 : 1.6 }}
      >
        <span className="garage-mouse" aria-hidden="true">
          <i />
        </span>
        <span className="garage-scroll-text">Scroll to walk around</span>
        <span className="garage-steps" aria-label={`Step ${stage + 1} of ${LAST + 1}`}>
          {STAGES.slice(0, LAST).map((_, i) => (
            <i key={i} className={i <= stage ? 'is-on' : ''} />
          ))}
        </span>
      </motion.div>

      <motion.button
        type="button"
        className="garage-skip"
        onClick={() => navigate('/map')}
        initial={{ opacity: 0 }}
        animate={{ opacity: diving ? 0 : 1 }}
        transition={{ duration: 0.6, delay: diving ? 0 : 1.6 }}
      >
        Skip to map
      </motion.button>

      {/* Fade to black as the camera dives in */}
      <motion.div
        className="garage-blackout"
        initial={{ opacity: 1 }}
        animate={{ opacity: diving || !ready ? 1 : 0 }}
        transition={diving ? { duration: 1, delay: 0.7, ease: 'easeIn' } : { duration: 1.4, delay: 0.3 }}
      />
    </section>
  )
}
