import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import caseStudies from '../../data/caseStudies.js'
import { useOpenCase } from './flight.jsx'

/*
  Case studies — a vertical stack of cards in 3D. Scroll and the next card rises into the
  centre while the one before tips back and fades; the cards above and below sit further
  away, angled and dimmed. The motion trails the scroll a little (a spring), which gives it
  that slightly delayed, weighty feel. Along the bottom a small F1 car drives a thin line
  as the progress bar.
*/
const N = caseStudies.length
const pad = (n) => String(n).padStart(2, '0')

export default function CaseList() {
  const reduce = useReducedMotion()
  const section = useRef(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  // trails the scroll a touch — the "delayed" 3D feel
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 20, mass: 0.6 })
  const progress = reduce ? scrollYProgress : smooth
  const pos = useTransform(progress, (p) => p * (N - 1))

  useEffect(() => {
    caseStudies.forEach((c) => {
      if (!c.cover) return
      const img = new Image()
      img.src = c.cover
    })
  }, [])

  // clicking a card that isn't in front scrolls it there
  const scrollTo = (i) => {
    const el = section.current
    if (!el) return
    const run = el.offsetHeight - window.innerHeight
    const y = el.offsetTop + (run * i) / (N - 1)
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <section ref={section} className="sk" style={{ height: `${N * 100}svh` }} aria-label="Case studies">
      <div className="sk-stage">
        <Backdrop />
        <BigPos pos={pos} />

        <div className="sk-deck">
          {caseStudies.map((study, i) => (
            <Card key={study.slug} study={study} i={i} pos={pos} onFocus={() => scrollTo(i)} />
          ))}
        </div>

        <Progress progress={progress} />
      </div>
    </section>
  )
}

function Card({ study, i, pos, onFocus }) {
  const open = useOpenCase()
  const navigate = useNavigate()
  const goTo = (to) => (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    navigate(to)
  }
  const shot = useRef(null)
  const ref = useRef(null)
  // d: how far this card is from the front (0 = in front, ±1 = one step above/below)
  const d = useTransform(pos, (p) => i - p)
  const y = useTransform(d, (v) => `${v * 82}%`)
  const z = useTransform(d, (v) => -Math.abs(v) * 420)
  const rotateX = useTransform(d, (v) => v * -18)
  // cards stay solid (no see-through overlaps); the ones behind fade toward white instead
  const veil = useTransform(d, (v) => Math.min(0.75, Math.abs(v) * 0.6))
  const opacity = useTransform(d, (v) => (Math.abs(v) > 1.6 ? Math.max(0, 1 - (Math.abs(v) - 1.6) * 2) : 1))
  const zIndex = useTransform(d, (v) => 10 - Math.round(Math.abs(v) * 3))

  // only the card in front opens; clicking one behind brings it forward
  useMotionValueEvent(d, 'change', (v) => {
    if (ref.current) ref.current.dataset.front = Math.abs(v) < 0.5 ? 'true' : 'false'
  })

  // a case with its own `link` opens that straight away, in a new tab
  const href = study.link || `/case-study/${study.slug}`
  const external = /^https?:/.test(href)
  const ext = external ? { target: '_blank', rel: 'noreferrer' } : {}
  // external links open in a new tab; the coming-soon card goes to its page here; the rest play the open animation
  const openIt = external ? undefined : study.link ? goTo(href) : open(study, () => shot.current)

  return (
    <motion.article
      ref={ref}
      className="sk-card"
      data-front={i === 0 ? 'true' : 'false'}
      style={{ y, z, rotateX, opacity, zIndex, '--accent': study.accent }}
      onClickCapture={(e) => {
        if (ref.current?.dataset.front !== 'true') {
          e.preventDefault()
          e.stopPropagation()
          onFocus()
        }
      }}
    >
      <a href={href} className="sk-shot" onClick={openIt} tabIndex={-1} aria-hidden="true" {...ext}>
        {study.comingSoon ? (
          <span className="sk-soon">
            <span className="sk-soon-flag" />
            <span className="sk-soon-tag">In the garage</span>
            <span className="sk-soon-title">
              Coming
              <br />
              soon<i>.</i>
            </span>
            <span className="sk-soon-note">Case study 03 · 2026</span>
          </span>
        ) : (
          <img ref={shot} src={study.cover} alt="" style={{ objectPosition: study.focus }} />
        )}
      </a>
      <div className="sk-info">
        <p className="sk-index">
          {/* team-colour tick, then the position — like a timing tower row */}
          <i className="sk-tick" aria-hidden="true" />
          <b>P{i + 1}</b> / {pad(N)}
          <span className="sk-kerb" aria-hidden="true" />
        </p>
        <h2 className="sk-name">{study.name}</h2>
        <p className="sk-about">{study.oneLiner}</p>
        <p className="sk-cat">
          {study.category} · {study.year}
        </p>
        <a href={href} className="sk-btn" onClick={openIt} {...ext}>
          {study.comingSoon ? 'Take a peek' : 'View case study'} <span aria-hidden="true">{external ? '↗' : '→'}</span>
        </a>
      </div>
      <motion.span className="sk-veil" style={{ opacity: veil }} aria-hidden="true" />
    </motion.article>
  )
}

// a few quiet marks on the white background: a dot grid and one thin racing line
function Backdrop() {
  return (
    <div className="sk-bg" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <path d="M-40 760 C 260 700 380 520 640 540 S 980 760 1240 640 S 1560 360 1680 420" />
        <path className="sk-bg-kerb" d="M-40 760 C 260 700 380 520 640 540" />
      </svg>
    </div>
  )
}

// thin line along the bottom with a small F1 car driving it
function Progress({ progress }) {
  const left = useTransform(progress, (p) => `calc(${p} * (100% - 88px))`)
  const fill = useTransform(progress, (p) => `scaleX(${p})`)
  return (
    <div className="sk-progress" aria-hidden="true">
      <span className="sk-line" />
      <motion.span className="sk-line-fill" style={{ transform: fill }} />
      <motion.span className="sk-car" style={{ left }}>
        <svg viewBox="0 0 176 40">
          {/* side view, nose to the right: rear wing, engine cover, halo, long nose, front wing */}
          <path className="sk-car-body" d="M4 6h22v5h-8l3 15h22l12-9h26l8-6h14l6 6 46 4 12 6v6l-6 2H8l-4-2z" />
          <path className="sk-car-stripe" d="M60 23h78l14 4H54z" />
          <path className="sk-car-halo" d="M80 14c6-8 18-8 24 0" />
          <circle cx="38" cy="30" r="9" className="sk-car-tyre" />
          <circle cx="38" cy="30" r="3.5" className="sk-car-hub" />
          <circle cx="140" cy="30" r="9" className="sk-car-tyre" />
          <circle cx="140" cy="30" r="3.5" className="sk-car-hub" />
        </svg>
      </motion.span>
      <span className="sk-flag" />
    </div>
  )
}

// the front card's position, huge and outlined behind the deck
function BigPos({ pos }) {
  const [i, setI] = useState(0)
  useMotionValueEvent(pos, 'change', (p) => setI(Math.min(N - 1, Math.max(0, Math.round(p)))))
  return (
    <p className="sk-bigpos" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={i} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}>
          P{i + 1}
        </motion.span>
      </AnimatePresence>
    </p>
  )
}
