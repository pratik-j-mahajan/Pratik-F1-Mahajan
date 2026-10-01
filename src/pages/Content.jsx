import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import { LINKEDIN_PROFILE, author, posts, season } from '../data/content.js'
import BackButton from '../components/BackButton.jsx'
import { Lines, Rise, ease, settle } from '../components/reveal.jsx'
import '../styles/cases.css'
import '../styles/content.css'

/*
  Content — the LinkedIn season, read like F1 telemetry. The headline number, then the whole
  season as a trace you can scrub week by week (total on top, weekly impressions below, the
  featured posts pinned where they went out), then the posts themselves. Pointing at a post
  finds it on the trace, and the other way round.
*/
const WEEK = 7 * 24 * 3600 * 1000
const start = new Date(`${season.startedOn}T00:00:00`)
const weekStart = (i) => new Date(start.getTime() + i * WEEK)
const fmtDate = (d, opts = { day: 'numeric', month: 'short' }) => d.toLocaleDateString('en-GB', opts)
const compact = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(n % 1e6 ? 2 : 0)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e5 ? 0 : 1)}K` : String(n)
const cumulative = season.weekly.reduce((acc, v) => [...acc, (acc.at(-1) || 0) + v], [])
const postUrl = (p) => p.url || LINKEDIN_PROFILE

export default function Content() {
  const [active, setActive] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <div className="cw ct">
      <header className={`cw-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="cw-nav-left">
          <BackButton />
          <span className="cw-brand">
            <img src="/images/f1-logo-red.svg" alt="" />
            <span>Content</span>
          </span>
        </div>
        <nav className="cw-nav-right">
          <a href={LINKEDIN_PROFILE} target="_blank" rel="noreferrer" className="cw-link">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <Hero />
      <Posts active={active} setActive={setActive} />
      <section className="ct-journey" aria-labelledby="ct-journey-title">
        <div className="ct-sec-head">
          <p className="ph-label">
            <b>The journey</b> · since {fmtDate(start, { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <Lines as="h2" id="ct-journey-title" className="ct-h2" lines={['Three months, week by week']} />
        </div>
        <Telemetry active={active} setActive={setActive} />
      </section>

      <section className="ct-follow">
        <Rise as="p" className="ct-follow-line">
          The season’s still running — a new post most weeks, on design, UX and building in public.
        </Rise>
        <Rise delay={0.1}>
          <a className="ph-btn" href={LINKEDIN_PROFILE} target="_blank" rel="noreferrer">
            Follow on LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </Rise>
      </section>
      <nav className="ct-foot" aria-label="Continue">
        <Link to="/case-study" className="cw-link">
          <span aria-hidden="true">←</span> Case studies
        </Link>
        <Link to="/map" className="cw-link">
          Return to the circuit <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </div>
  )
}

/* ------------------------------------------------------------------ hero: the number, then the work */

function Hero() {
  const num = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = num.current
    const fmt = (v) => Math.round(v).toLocaleString('en-US')
    if (reduce) {
      el.textContent = fmt(season.impressions)
      return
    }
    const run = animate(0, season.impressions, {
      duration: 2.2,
      delay: 0.25,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = fmt(v)),
    })
    return () => run.stop()
  }, [reduce])

  // newest first, repeated so the strip loops seamlessly
  const strip = [...posts].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <section className="ct-hero" aria-labelledby="ct-title">
      <div className="ct-hero-top">
        <div>
          <Rise as="p" className="ph-label" play>
            <b>LinkedIn</b> · Season 01 · {fmtDate(start, { month: 'short', year: 'numeric' })} — today
          </Rise>
          <h1 id="ct-title" className="ct-title" aria-label={`${season.impressions.toLocaleString('en-US')}+ impressions in 3 months`}>
            <Rise as="span" className="ct-num" play delay={0.1} aria-hidden="true">
              <span ref={num}>0</span>
              <i>+</i>
            </Rise>
          </h1>
        </div>
        <Rise className="ct-hero-side" play delay={0.35}>
          <p className="ct-sub">impressions in my first three months of posting — about design, UX and building in public.</p>
          <dl className="ct-mini">
            {season.totals.map((t) => (
              <div key={t.label}>
                <dt>{t.label}</dt>
                <dd>{t.value}</dd>
              </div>
            ))}
          </dl>
        </Rise>
      </div>

      {/* the posts themselves, running past */}
      <Rise className="ct-strip" play delay={0.5} y={40}>
        <div className="ct-strip-track">
          {[0, 1].map((k) => (
            <ul key={k} className="ct-strip-set" aria-hidden={k === 1 ? 'true' : undefined}>
              {strip.map((p) => (
                <li key={p.id}>
                  <a
                    href={postUrl(p)}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={k === 1 ? -1 : undefined}
                    aria-label={`${p.hook} — open on LinkedIn`}
                  >
                    <Thumb p={p} />
                    <span className="ct-strip-views">
                      <EyeIcon /> {compact(p.impressions)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </Rise>
    </section>
  )
}

const EyeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="ct-eye">
    <path d="M1 8s2.6-5 7-5 7 5 7 5-2.6 5-7 5-7-5-7-5Z" />
    <circle cx="8" cy="8" r="2.2" />
  </svg>
)

// the post's image, or a clean cover drawn from its first line
const COVERS = ['navy', 'paper', 'red', 'ink']
function Thumb({ p }) {
  if (p.thumb) return <img className="ct-thumb" src={p.thumb} alt="" loading="lazy" />
  const tone = COVERS[posts.indexOf(p) % COVERS.length]
  return (
    <span className={`ct-thumb ct-cover ct-cover--${tone}`}>
      <span className="ct-cover-top">
        <b>{author.name}</b>
        <i>{p.topic}</i>
      </span>
      <span className="ct-cover-hook">{p.hook}</span>
      <span className="ct-cover-foot">
        {p.format === 'carousel' ? (
          <>
            <span className="ct-cover-dots">
              <i />
              <i />
              <i />
              <i />
            </span>
            Swipe →
          </>
        ) : (
          <span>{p.format === 'image' ? 'Post' : 'Text post'}</span>
        )}
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ telemetry */

// smooth line through points (Catmull-Rom as cubic Béziers)
function smooth(pts) {
  return pts.reduce((d, p, i, a) => {
    if (i === 0) return `M${p[0]},${p[1]}`
    const p0 = a[i - 2] || a[i - 1]
    const p1 = a[i - 1]
    const p2 = p
    const p3 = a[i + 1] || p
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
  }, '')
}

function useWidth(ref) {
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [ref])
  return w
}

const MILESTONES = [250000, 500000, 750000, 1000000]

function Telemetry({ active, setActive }) {
  const box = useRef(null)
  const w = useWidth(box)
  const reduce = useReducedMotion()
  const seen = useInView(box, { once: true, amount: 0.35 })
  const n = season.weekly.length
  const [cursor, setCursor] = useState(n - 1)

  const narrow = w < 640
  const H = narrow ? 340 : 440
  const L = 4
  const R = narrow ? 46 : 70
  const T = narrow ? 70 : 84 // headroom for the readout, so it never covers the trace
  const lineB = Math.round(H * 0.64)
  const barT = lineB + 34
  const barB = H - 30
  const top = 1050000
  const maxWeek = Math.max(...season.weekly)
  const step = (w - L - R) / (n - 1)
  const x = (i) => L + i * step
  const y = (v) => T + (1 - v / top) * (lineB - T)

  const geo = useMemo(() => {
    if (!w) return null
    const pts = cumulative.map((v, i) => [x(i), y(v)])
    const line = smooth(pts)
    return { line, area: `${line} L${x(n - 1)},${lineB} L${x(0)},${lineB} Z` }
  }, [w]) // eslint-disable-line react-hooks/exhaustive-deps

  // pointing at a post card moves the cursor to its week
  const activePost = posts.find((p) => p.id === active)
  const shown = activePost ? activePost.week - 1 : cursor
  const crossed = cumulative.findIndex((v) => v >= 1000000)

  const onMove = (e) => {
    const r = box.current.getBoundingClientRect()
    const i = Math.round((e.clientX - r.left - L) / step)
    setCursor(Math.min(n - 1, Math.max(0, i)))
    if (active) setActive(null)
  }
  const onKey = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    setActive(null)
    setCursor((c) => Math.min(n - 1, Math.max(0, c + (e.key === 'ArrowRight' ? 1 : -1))))
  }

  const on = seen || reduce
  const sweep = { duration: reduce ? 0 : 1.8, ease }
  const readoutLeft = w ? Math.min(Math.max(x(shown), 90), w - 90) : 0

  return (
    <section className="ct-tele" aria-label="Impressions over the season">
      <div className="ct-tele-head">
        <p className="ph-label">
          <b>Telemetry</b> · impressions by week
        </p>
        <p className="ct-legend" aria-hidden="true">
          <span className="ct-key ct-key--total" /> Total
          <span className="ct-key ct-key--week" /> Per week
          <span className="ct-key ct-key--post" /> Featured post
        </p>
      </div>

      <div
        ref={box}
        className="ct-chart"
        style={{ height: H }}
        onPointerMove={onMove}
        onPointerLeave={() => setCursor(n - 1)}
        onKeyDown={onKey}
        tabIndex={0}
        role="group"
        aria-label={`Week ${shown + 1}: ${cumulative[shown].toLocaleString('en-US')} total impressions. Use left and right arrows to move through the season.`}
      >
        {geo && (
          <svg width={w} height={H} className="ct-svg" aria-hidden="true">
            <defs>
              <linearGradient id="ct-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#e10600" stopOpacity="0.16" />
                <stop offset="1" stopColor="#e10600" stopOpacity="0" />
              </linearGradient>
              <clipPath id="ct-sweep">
                <motion.rect
                  x="0"
                  y="0"
                  height={H}
                  initial={{ width: reduce ? w : 0 }}
                  animate={{ width: on ? w : 0 }}
                  transition={sweep}
                />
              </clipPath>
            </defs>

            {/* milestones */}
            {MILESTONES.map((m) => (
              <g key={m} className={`ct-mile${m === 1000000 ? ' is-million' : ''}`}>
                <line x1={L} x2={w - R + 6} y1={y(m)} y2={y(m)} />
                <text x={w - R + 12} y={y(m) + 4}>
                  {compact(m)}
                </text>
              </g>
            ))}

            <g clipPath="url(#ct-sweep)">
              <path d={geo.area} fill="url(#ct-fill)" />
              <path d={geo.line} className="ct-line" />
              {/* weekly impressions, like a throttle trace under the speed trace */}
              {season.weekly.map((v, i) => {
                const h = (v / maxWeek) * (barB - barT)
                const bw = Math.max(4, step * 0.42)
                return (
                  <rect key={i} className={`ct-bar${i === shown ? ' is-on' : ''}`} x={x(i) - bw / 2} y={barB - h} width={bw} height={h} />
                )
              })}
            </g>
            <line className="ct-base" x1={L} x2={w - R + 6} y1={barB} y2={barB} />

            {/* chequered flag where the season crossed a million */}
            {crossed >= 0 && on && (
              <motion.g
                className="ct-flag"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: reduce ? 0 : 1.7, ease: settle }}
              >
                <line x1={x(crossed)} x2={x(crossed)} y1={y(cumulative[crossed])} y2={y(1000000) - 26} />
                <rect x={x(crossed) + 1} y={y(1000000) - 28} width="18" height="12" fill="url(#ct-check)" />
              </motion.g>
            )}
            <defs>
              <pattern id="ct-check" width="6" height="6" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="#fff" />
                <rect width="3" height="3" fill="#111214" />
                <rect x="3" y="3" width="3" height="3" fill="#111214" />
              </pattern>
            </defs>

            {/* cursor */}
            <line className="ct-cursor" x1={x(shown)} x2={x(shown)} y1={T - 8} y2={barB} />
            <circle className="ct-cursor-dot" cx={x(shown)} cy={y(cumulative[shown])} r="5" />

            {/* featured posts, pinned where they went out */}
            {posts.map((p, k) => {
              const i = p.week - 1
              const hot = active === p.id
              return (
                <motion.g
                  key={p.id}
                  className={`ct-pin${hot ? ' is-hot' : ''}`}
                  initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                  animate={on ? { opacity: 1, scale: 1 } : undefined}
                  transition={{ duration: 0.4, delay: reduce ? 0 : 0.5 + (i / n) * 1.3, ease: settle }}
                  style={{ transformOrigin: `${x(i)}px ${y(cumulative[i])}px` }}
                  onPointerEnter={() => setActive(p.id)}
                >
                  <circle cx={x(i)} cy={y(cumulative[i])} r={hot ? 13 : 10} />
                  <text x={x(i)} y={y(cumulative[i]) + 4}>
                    {k + 1}
                  </text>
                </motion.g>
              )
            })}

            {/* week labels */}
            {season.weekly.map((_, i) =>
              narrow && i % 2 ? null : (
                <text key={i} className={`ct-week${i === shown ? ' is-on' : ''}`} x={x(i)} y={H - 8}>
                  W{i + 1}
                </text>
              ),
            )}
          </svg>
        )}

        {/* readout that follows the cursor */}
        {w > 0 && (
          <div className="ct-readout" style={{ left: readoutLeft }} aria-hidden="true">
            <p className="ct-readout-week">
              Week {shown + 1} · {fmtDate(weekStart(shown))}
            </p>
            <p className="ct-readout-total">{cumulative[shown].toLocaleString('en-US')}</p>
            <p className="ct-readout-delta">
              <b>+{compact(season.weekly[shown])}</b> this week
            </p>
          </div>
        )}
      </div>
      <p className="ct-hint">Move across the trace to scrub the season · ← → on a keyboard</p>
    </section>
  )
}

/* ------------------------------------------------------------------ posts */

// best = views, with engagement weighted in (a comment is worth more than a reaction)
const score = (p) => p.impressions + p.reactions * 20 + p.comments * 60
const LATEST = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
const BEST = [...posts].sort((a, b) => score(b) - score(a)).slice(0, 3)
const TODAY = new Date()
const ago = (iso) => {
  const days = Math.max(0, Math.round((TODAY - new Date(`${iso}T00:00:00`)) / 864e5))
  return days < 1 ? 'Today' : days < 7 ? `${days}d` : days < 60 ? `${Math.round(days / 7)}w` : `${Math.round(days / 30)}mo`
}

function Posts({ active, setActive }) {
  return (
    <section className="ct-posts" aria-labelledby="ct-posts-title">
      <div className="ct-sec-head ct-sec-head--row">
        <div>
          <p className="ph-label">
            <b>On the feed</b> · updates as I post
          </p>
          <Lines as="h2" id="ct-posts-title" className="ct-h2" lines={['The posts']} />
        </div>
        <a className="cw-link" href={LINKEDIN_PROFILE} target="_blank" rel="noreferrer">
          All posts on LinkedIn <span aria-hidden="true">↗</span>
        </a>
      </div>

      <PostRow label="Latest" note="The three newest" list={LATEST} active={active} setActive={setActive} />
      <PostRow label="Best performing" note="Ranked by views and engagement" list={BEST} ranked active={active} setActive={setActive} />
    </section>
  )
}

function PostRow({ label, note, list, ranked = false, active, setActive }) {
  return (
    <div className="ct-row">
      <p className="ct-row-head">
        <b>{label}</b> {note}
      </p>
      <ol className="ct-grid" onPointerLeave={() => setActive(null)}>
        {list.map((p, i) => (
          <li key={p.id}>
            <PostCard
              p={p}
              rank={ranked ? i + 1 : null}
              fresh={!ranked && i === 0}
              hot={active === p.id}
              onHot={() => setActive(p.id)}
              delay={i * 0.08}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}

// a LinkedIn post, set in the site's type: author, first line, the visual, the numbers
function PostCard({ p, rank, fresh, hot, onHot, delay }) {
  return (
    <Rise
      as="a"
      href={postUrl(p)}
      target="_blank"
      rel="noreferrer"
      className={`ln${hot ? ' is-hot' : ''}`}
      onPointerEnter={onHot}
      onFocus={onHot}
      delay={delay}
      aria-label={`${p.hook} — ${p.impressions.toLocaleString('en-US')} impressions. Open on LinkedIn`}
    >
      <span className="ln-head">
        <img className="ln-avatar" src={author.avatar} alt="" />
        <span className="ln-who">
          <b>{author.name}</b>
          <small>
            {author.role} · {ago(p.date)}
          </small>
        </span>
        {rank ? (
          <span className={`ln-rank${rank === 1 ? ' is-p1' : ''}`}>{rank === 1 ? 'P1 · Fastest lap' : `P${rank}`}</span>
        ) : (
          fresh && <span className="ln-new">New</span>
        )}
      </span>
      <span className="ln-hook">{p.hook}</span>
      <span className="ln-media">
        <Thumb p={p} />
      </span>
      <span className="ln-foot">
        <span className="ln-react">
          <span className="ln-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {compact(p.reactions)}
        </span>
        <span>{compact(p.comments)} comments</span>
        <span className="ln-views">
          <EyeIcon /> {compact(p.impressions)}
        </span>
      </span>
      <span className="ln-open">
        View on LinkedIn <i aria-hidden="true">↗</i>
      </span>
    </Rise>
  )
}
