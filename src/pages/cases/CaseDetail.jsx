import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { BEHANCE_PROFILE, getCaseStudy, realCaseStudies as caseStudies } from '../../data/caseStudies.js'
import { Lines, Rise, ease } from '../../components/reveal.jsx'
import { CoverFlight, rectOf, useOpenCase } from './flight.jsx'

/*
  A case page is an overview, not an article: title and facts, the cover, then the story
  in three beats (problem → decisions → outcome), then Behance and the next project.
*/
const N = caseStudies.length
const pad = (n) => String(n).padStart(2, '0')
// F1 timing colours mark the three beats
const BEATS = [
  ['The problem', '#a24bff'],
  ['Key decisions', '#1fcf6b'],
  ['The outcome', '#f5c518'],
]

export default function CaseDetail() {
  const { slug } = useParams()
  const study = getCaseStudy(slug)
  if (!study) return <Navigate to="/case-study" replace />
  return <Study key={study.slug} study={study} />
}

function Study({ study }) {
  const i = caseStudies.indexOf(study)
  const prev = caseStudies[(i - 1 + N) % N]
  const next = caseStudies[(i + 1) % N]
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })

  return (
    <article className="cs2" style={{ '--accent': study.accent }}>
      <motion.span className="cs2-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <nav className="cs2-bar" aria-label="Case studies">
        <Link to="/case-study" className="cw-link">
          <span aria-hidden="true">←</span> All case studies
        </Link>
        <div className="cs2-step">
          <Link to={`/case-study/${prev.slug}`} aria-label={`Previous: ${prev.name}`}>
            ←
          </Link>
          <span>
            <b>{pad(i + 1)}</b> / {pad(N)}
          </span>
          <Link to={`/case-study/${next.slug}`} aria-label={`Next: ${next.name}`}>
            →
          </Link>
        </div>
      </nav>

      <Hero study={study} i={i} />

      <section className="cs2-story" aria-label="Overview">
        <Beat n={0}>
          <Rise as="p" className="cs2-statement">
            {study.problem}
          </Rise>
        </Beat>
        <Beat n={1}>
          <ol className="cs2-decisions">
            {study.approach.decisions.map((d, k) => (
              <Rise as="li" key={d.title} delay={k * 0.08}>
                <span>{pad(k + 1)}</span>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </Rise>
            ))}
          </ol>
        </Beat>
        <Beat n={2}>
          <Rise as="p" className="cs2-statement">
            {study.outcome}
          </Rise>
        </Beat>
      </section>

      {study.screens.length > 0 && (
        <section className="cs2-screens" aria-label="Selected screens">
          {study.screens.map((s, k) => (
            <Rise as="figure" key={s.src} delay={k * 0.08}>
              <img src={s.src} alt={s.caption} loading="lazy" />
              <figcaption>{s.caption}</figcaption>
            </Rise>
          ))}
        </section>
      )}

      <End study={study} next={next} />
    </article>
  )
}

function Hero({ study, i }) {
  const { state } = useLocation()
  const reduce = useReducedMotion()
  const from = reduce ? null : state?.from
  const frame = useRef(null)
  const [to, setTo] = useState(null)
  const [landed, setLanded] = useState(!from)

  useLayoutEffect(() => {
    if (!from) return
    window.scrollTo(0, 0)
    setTo(rectOf(frame.current))
    // the flight is one-shot: a refresh or a later back/forward shouldn't replay it
    const h = window.history.state
    if (h?.usr?.from) window.history.replaceState({ ...h, usr: null }, '')
  }, [from])

  useEffect(() => {
    if (!from) return
    const t = setTimeout(() => setLanded(true), 1400)
    return () => clearTimeout(t)
  }, [from])

  return (
    <header className="cs2-hero">
      <div className="cs2-head">
        <div>
          <Rise as="p" className="pl-label" play delay={0.1}>
            <b>Pit box {pad(i + 1)}</b> · {study.category}
          </Rise>
          <Lines as="h1" className="cs2-title" play delay={0.15} lines={[study.name]} />
          <Rise as="p" className="cs2-headline" play delay={0.3}>
            {study.headline}
          </Rise>
        </div>
        <Rise as="dl" className="cs2-facts" play delay={0.4}>
          {[
            ['Role', study.role],
            ['Timeline', study.timeline],
            ['Year', study.year],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </Rise>
      </div>

      <div className="cs2-cover" ref={frame}>
        <motion.img
          src={study.cover}
          alt={`${study.name} — ${study.oneLiner}`}
          style={{ visibility: landed ? 'visible' : 'hidden' }}
          initial={from || reduce ? false : { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.08 }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease }}
        />
      </div>

      {from && to && !landed && <CoverFlight from={from} to={to} src={study.cover} onDone={() => setLanded(true)} />}
    </header>
  )
}

function Beat({ n, children }) {
  const [label, color] = BEATS[n]
  return (
    <div className="cs2-beat" style={{ '--beat': color }}>
      <Rise as="h2" className="cs2-beat-label">
        <i aria-hidden="true" />
        <span>S{n + 1}</span> {label}
      </Rise>
      <div className="cs2-beat-body">{children}</div>
    </div>
  )
}

function End({ study, next }) {
  const open = useOpenCase()
  const shot = useRef(null)
  const behance = study.behance || BEHANCE_PROFILE

  return (
    <section className="cs2-end" aria-label="What next">
      <Rise className="cs2-behance">
        <span className="pl-checker" aria-hidden="true" />
        <div>
          <p className="pl-label">
            <b>Full case study</b>
          </p>
          <p className="cs2-behance-line">The whole story — research, process and final screens — lives on Behance.</p>
        </div>
        <a className="pl-btn pl-btn--red" href={behance} target="_blank" rel="noreferrer">
          View on Behance <span aria-hidden="true">↗</span>
        </a>
      </Rise>

      <Rise>
        <a
          href={`/case-study/${next.slug}`}
          className="cs2-next"
          onClick={open(next, () => shot.current)}
          aria-label={`Next project: ${next.name}`}
        >
          <span className="cs2-next-shot" ref={shot}>
            <img src={next.cover} alt="" loading="lazy" />
          </span>
          <span className="cs2-next-copy">
            <span className="pl-label">
              <b>Next project</b> · {next.category}
            </span>
            <span className="cs2-next-name">
              {next.name} <i aria-hidden="true">→</i>
            </span>
          </span>
        </a>
      </Rise>

      <nav className="cs2-foot" aria-label="Continue">
        <Link to="/case-study" className="cw-link">
          <span aria-hidden="true">←</span> All case studies
        </Link>
        <Link to="/map" className="cw-link">
          Return to the circuit <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </section>
  )
}
