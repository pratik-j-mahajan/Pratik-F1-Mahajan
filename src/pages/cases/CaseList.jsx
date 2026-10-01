import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import caseStudies, { BEHANCE_PROFILE } from '../../data/caseStudies.js'
import { Lines, Rise } from '../../components/reveal.jsx'
import { useOpenCase } from './flight.jsx'

/*
  Pit lane — the case study index. Scroll and the projects glide past as large panels; along
  the bottom a 3D car drives the pit lane with your scroll: it pulls away, brakes, and parks
  in each project's pit box, then crosses the chequered line at the end. The car is the
  progress bar. Phones and reduced motion get a plain stack of the same panels.
*/
const PitCar = lazy(() => import('./PitCar.jsx'))
const N = caseStudies.length
const STOPS = N + 1 // every project, then the finish
const pad = (n) => String(n).padStart(2, '0')
// where each stop sits along the track (0 → 1)
const box = (k) => 0.1 + (k * 0.78) / N

// scroll → stop, with a hold at every stop and eased runs between them
function sequence(v) {
  const x = Math.min(Math.max(v, 0), 1) * (STOPS - 1)
  const s = Math.floor(x)
  if (s >= STOPS - 1) return STOPS - 1
  const t = Math.min(Math.max((x - s - 0.22) / 0.56, 0), 1)
  return s + (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
}

function useWide() {
  const q = '(min-width: 900px)'
  const [wide, setWide] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

export default function CaseList() {
  const wide = useWide()
  const reduce = useReducedMotion()
  const open = useOpenCase()

  useEffect(() => {
    caseStudies.forEach((c) => {
      const img = new Image()
      img.src = c.cover
    })
  }, [])

  return <div className="pl">{wide && !reduce ? <PitLane open={open} /> : <Stack open={open} />}</div>
}

/* ------------------------------------------------------------------ desktop: the pit lane */

function PitLane({ open }) {
  const track = useRef(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const q = useSpring(useTransform(scrollYProgress, sequence), { stiffness: 110, damping: 24, mass: 0.6, restDelta: 0.0005 })
  const at = useTransform(q, (v) => {
    const k = Math.min(Math.floor(v), STOPS - 2)
    return box(k) + (box(k + 1) - box(k)) * (v - k)
  })
  const fill = useTransform(at, (v) => v)
  const [stop, setStop] = useState(0)
  useMotionValueEvent(q, 'change', (v) => setStop(Math.round(v)))

  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  const goTo = (k) => {
    const el = track.current
    const top = el.getBoundingClientRect().top + window.scrollY
    const run = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + (run * k) / (STOPS - 1), behavior: 'smooth' })
  }

  const current = caseStudies[Math.min(stop, N - 1)]

  return (
    <section ref={track} className="pl-track" style={{ height: `${STOPS * 90 + 10}svh` }} aria-label="Case studies">
      <div className="pl-stage">
        <header className="pl-head">
          <div>
            <Rise as="p" className="pl-label" play>
              <b>Case studies</b> · {pad(N)} projects
            </Rise>
            <Lines as="h1" className="pl-title" play delay={0.05} lines={['Selected work']} />
          </div>
          <p className="pl-now" aria-live="polite">
            {stop < N ? (
              <>
                <b>Pit box {pad(stop + 1)}</b> / {pad(N)} · {current.name}
              </>
            ) : (
              <b>Chequered flag</b>
            )}
          </p>
        </header>

        {/* the deck: details on the left, the 3D cards on the right */}
        <div className="pl-deck-row">
          <div className="pl-copy" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stop}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, y: -18, transition: { duration: 0.22 } }}
              >
                {stop < N ? <Info study={caseStudies[stop]} i={stop} open={open} /> : <FinishInfo />}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="pl-deck">
            {caseStudies.map((c, i) => (
              <Card3D key={c.slug} i={i} q={q} study={c} open={open} active={stop === i} />
            ))}
            <Card3D i={N} q={q} finish active={stop === N} />
          </div>
        </div>

        {/* the pit lane: kerbs, pit boxes, finish line — the car drives it */}
        <div className="pl-road">
          <div className="pl-lane" aria-hidden="true">
            <motion.span className="pl-lane-fill" style={{ scaleX: fill }} />
          </div>
          {caseStudies.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              className={`pl-box${stop === i ? ' is-on' : ''}`}
              style={{ left: `${box(i) * 100}%` }}
              onClick={() => goTo(i)}
              aria-label={`Go to ${c.name}`}
            >
              <span className="pl-box-mark" aria-hidden="true" />
              <span className="pl-box-label">
                <b>{pad(i + 1)}</b> {c.name}
              </span>
            </button>
          ))}
          <span className="pl-finish" style={{ left: `${box(N) * 100}%` }} aria-hidden="true" />
          <div className={`pl-car${ready ? ' is-ready' : ''}`} aria-hidden="true">
            <Suspense fallback={null}>
              <PitCar at={at} onReady={onReady} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}

function Panel({ study, i, open, active }) {
  const shot = useRef(null)
  const href = `/case-study/${study.slug}`
  return (
    <article className="pl-panel" style={{ '--accent': study.accent }}>
      <a
        ref={shot}
        href={href}
        className="pl-cover"
        onClick={open(study, () => shot.current)}
        tabIndex={active ? 0 : -1}
        aria-label={`Open ${study.name}`}
      >
        <img src={study.cover} alt="" draggable="false" />
      </a>
      <div className="pl-info">
        <p className="pl-label">
          <b>Pit box {pad(i + 1)}</b> · {study.year}
        </p>
        <h2 className="pl-name">{study.name}</h2>
        <p className="pl-cat">{study.category}</p>
        <p className="pl-line">{study.oneLiner}</p>
        <dl className="pl-meta">
          <div>
            <dt>Role</dt>
            <dd>{study.role}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{study.timeline}</dd>
          </div>
        </dl>
        <a href={href} className="pl-btn" onClick={open(study, () => shot.current)} tabIndex={active ? 0 : -1}>
          View case study <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  )
}

function Info({ study, i, open }) {
  const href = `/case-study/${study.slug}`
  return (
    <div className="pl-info">
      <p className="pl-label">
        <b>Pit box {pad(i + 1)}</b> · {study.year}
      </p>
      <h2 className="pl-name">{study.name}</h2>
      <p className="pl-cat">{study.category}</p>
      <p className="pl-line">{study.oneLiner}</p>
      <dl className="pl-meta">
        <div>
          <dt>Role</dt>
          <dd>{study.role}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>{study.timeline}</dd>
        </div>
      </dl>
      <a href={href} className="pl-btn" onClick={open(study, () => document.querySelector(`[data-card="${study.slug}"]`))}>
        View case study <span aria-hidden="true">→</span>
      </a>
    </div>
  )
}

function FinishInfo() {
  return (
    <div className="pl-info">
      <p className="pl-label">
        <b>Chequered flag</b> · end of selection
      </p>
      <h2 className="pl-name">More work lives on Behance.</h2>
      <p className="pl-line">Process, research and final screens for every project — and a few more.</p>
      <div className="pl-finish-actions">
        <a className="pl-btn" href={BEHANCE_PROFILE} target="_blank" rel="noreferrer">
          Visit Behance <span aria-hidden="true">↗</span>
        </a>
        <Link className="cw-link" to="/map">
          Return to the circuit <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}

/*
  One card in the 3D deck. `d` = its distance from the current stop: the card at 0 faces
  you; upcoming cards wait deeper in space, angled toward the centre; a finished card
  swings out to the left and fades. The front card also leans toward the pointer.
*/
function Card3D({ i, q, study, finish = false, open, active }) {
  const d = useTransform(q, (v) => i - v)
  const x = useTransform(d, (v) => `${v < 0 ? v * 62 : v * 36}%`)
  const z = useTransform(d, (v) => (v < 0 ? v * -160 : v * -420))
  const rotateY = useTransform(d, (v) => (v < 0 ? v * -55 : v * -26))
  const opacity = useTransform(d, (v) => (v < 0 ? Math.max(0, 1 + v * 2.6) : Math.max(0, 1 - Math.max(0, v - 0.6) * 0.55)))
  const brightness = useTransform(d, (v) => 1 - Math.min(Math.abs(v), 1.6) * 0.28)
  const filter = useMotionTemplate`brightness(${brightness})`
  const zIndex = useTransform(d, (v) => 100 - Math.round(Math.abs(v) * 10))
  const imgX = useTransform(d, (v) => `${v * -6}%`)

  // pointer lean on the front card
  const tiltX = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const tiltY = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(30)
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28), rgba(255,255,255,0) 45%)`
  const onMove = (e) => {
    if (!active) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    tiltY.set((px - 0.5) * 10)
    tiltX.set(-(py - 0.5) * 8)
    glareX.set(px * 100)
    glareY.set(py * 100)
  }
  const onLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  const face = finish ? (
    <span className="pl3-face pl3-face--finish">
      <span className="pl3-flag" aria-hidden="true" />
      <span className="pl3-finish-text">
        <b>Chequered flag</b>
        More on Behance ↗
      </span>
    </span>
  ) : (
    <span className="pl3-face">
      <motion.img src={study.cover} alt="" draggable="false" style={{ x: imgX, scale: 1.14 }} />
    </span>
  )

  return (
    <motion.div className="pl3-slot" style={{ x, z, rotateY, opacity, zIndex }}>
      <motion.a
        className={`pl3-card${active ? ' is-on' : ''}`}
        href={finish ? BEHANCE_PROFILE : `/case-study/${study.slug}`}
        target={finish ? '_blank' : undefined}
        rel={finish ? 'noreferrer' : undefined}
        data-card={finish ? undefined : study.slug}
        onClick={finish ? undefined : open(study, () => document.querySelector(`[data-card="${study.slug}"]`))}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        tabIndex={active ? 0 : -1}
        aria-label={finish ? 'More work on Behance' : `Open ${study.name}`}
        style={{ rotateX: tiltX, rotateY: tiltY, filter }}
      >
        {face}
        {!finish && <span className="pl3-tag">{pad(i + 1)}</span>}
        <motion.span className="pl3-glare" style={{ background: glare }} aria-hidden="true" />
      </motion.a>
      <span className="pl3-shadow" aria-hidden="true" />
    </motion.div>
  )
}

function FinishPanel() {
  return (
    <article className="pl-panel pl-panel--finish">
      <span className="pl-checker" aria-hidden="true" />
      <div className="pl-finish-copy">
        <p className="pl-label">
          <b>Chequered flag</b> · end of selection
        </p>
        <h2 className="pl-name">More work lives on Behance.</h2>
        <p className="pl-line">Process, research and final screens for every project — and a few more.</p>
        <div className="pl-finish-actions">
          <a className="pl-btn" href={BEHANCE_PROFILE} target="_blank" rel="noreferrer">
            Visit Behance <span aria-hidden="true">↗</span>
          </a>
          <Link className="cw-link" to="/map">
            Return to the circuit <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ phones / reduced motion */

function Stack({ open }) {
  return (
    <div className="pl-stack">
      <header className="pl-head pl-head--stack">
        <Rise as="p" className="pl-label" play>
          <b>Case studies</b> · {pad(N)} projects
        </Rise>
        <Lines as="h1" className="pl-title" play delay={0.05} lines={['Selected work']} />
      </header>
      {caseStudies.map((c, i) => (
        <Rise key={c.slug} delay={i === 0 ? 0.15 : 0}>
          <Panel study={c} i={i} open={open} active />
        </Rise>
      ))}
      <Rise>
        <FinishPanel />
      </Rise>
    </div>
  )
}
