import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { LINKEDIN_PROFILE, author, posts, season } from '../data/content.js'
import BackButton from '../components/BackButton.jsx'
import { Rise, settle } from '../components/reveal.jsx'
import '../styles/cases.css'
import '../styles/content.css'

/*
  Content — the LinkedIn season, built around the sticker (photo + blue cut-out border).
  Hero: the sticker at full resolution, with the season scrolling behind it and live-feeling
  LinkedIn bits floating round it (headline + counter, an analytics card, a notification
  stack that keeps ticking, a profile card). Tap the sticker and it throws reactions.
  Then the feed (Top / Latest / All, likeable cards), a lap-by-lap chart of the season,
  and a follow banner. Everything is read from src/data/content.js.
*/
const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const compact = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(n % 1e6 ? 2 : 0)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(n >= 1e5 ? 0 : 1)}K` : String(n)
const postUrl = (p) => p.url || LINKEDIN_PROFILE
const score = (p) => p.impressions + p.reactions * 20 + p.comments * 60

const REACTIONS = [
  { k: 'like', icon: '👍', bg: '#378fe9' },
  { k: 'celebrate', icon: '👏', bg: '#6dae4f' },
  { k: 'love', icon: '❤️', bg: '#df704d' },
  { k: 'insight', icon: '💡', bg: '#f5bb5c' },
  { k: 'funny', icon: '😄', bg: '#44bfd3' },
]

export default function Content() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <div className="cw lk">
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
      <Work />
      <FollowCard />

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

/* ------------------------------------------------------------------ hero */

function Hero() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 18 })
  const sy = useSpring(my, { stiffness: 80, damping: 18 })
  // only the photo follows the cursor; everything else stays put
  const picX = useTransform(sx, (v) => v * 16)
  const picY = useTransform(sy, (v) => v * 10)

  const onMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <section className="lk-hero" onPointerMove={onMove} onPointerLeave={onLeave} aria-labelledby="lk-title">
      <div className="lk-marquee" aria-hidden="true">
        {['1M+ IMPRESSIONS · DESIGN · UX · BUILDING IN PUBLIC · ', '38 POSTS · 13 WEEKS · SEASON 01 · PUNE → THE FEED · '].map((t, i) => (
          <div key={i} className={`lk-marquee-row${i ? ' is-rev' : ''}`}>
            <span>{t.repeat(4)}</span>
            <span>{t.repeat(4)}</span>
          </div>
        ))}
      </div>

      <div className="lk-stage">
        <div className="lk-col lk-col--left">
          <Headline />
          <Analytics />
        </div>

        <div className="lk-centre">
          <Sticker x={picX} y={picY} />
        </div>

        <div className="lk-col lk-col--right">
          <Notifications />
          <Profile />
        </div>
      </div>

      <motion.dl
        className="lk-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55, ease: settle }}
      >
        {season.totals.map((t, i) => (
          <div key={t.label}>
            <dt>
              <b>S{i + 1}</b> {t.label}
            </dt>
            <dd>{t.value}</dd>
          </div>
        ))}
      </motion.dl>
      <span className="lk-hero-kerb" aria-hidden="true" />
    </section>
  )
}

function Headline() {
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
      duration: 2.4,
      delay: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = fmt(v)),
    })
    return () => run.stop()
  }, [reduce])

  return (
    <div className="lk-head">
      <Rise as="p" className="lk-label" play>
        <i className="lk-live" /> LinkedIn · Season 01
      </Rise>
      <h1 id="lk-title" className="lk-big" aria-label={`${season.impressions.toLocaleString('en-US')}+ impressions in 3 months`}>
        <Rise as="span" play delay={0.08} aria-hidden="true">
          1M<em>+</em>
        </Rise>
      </h1>
      <Rise as="p" className="lk-sub" play delay={0.16}>
        <b>impressions</b> in my first three months of posting about design.
      </Rise>
      <Rise as="div" className="lk-counter" play delay={0.24} aria-hidden="true">
        <span className="lk-counter-num" ref={num}>
          0
        </span>
        <span className="lk-counter-tag">
          <i className="lk-live" /> live
        </span>
      </Rise>
    </div>
  )
}

// tiny sparkline of the season, drawn in on load
function Analytics() {
  const w = 240
  const h = 64
  const max = Math.max(...season.weekly)
  const pts = season.weekly.map((v, i) => [(i / (season.weekly.length - 1)) * w, h - 4 - (v / max) * (h - 12)])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const last = season.weekly.at(-1)
  const avg = season.weekly.reduce((a, b) => a + b, 0) / season.weekly.length
  const best = season.weekly.indexOf(max)
  const up = Math.round(((last - avg) / avg) * 100)

  return (
    <Rise className="lk-float lk-analytics" play delay={0.5}>
      <p className="lk-float-top">
        <span>Analytics · weekly</span>
        <b className="lk-chip">Peak W{best + 1}</b>
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="lk-spark" aria-hidden="true">
        <defs>
          <linearGradient id="lk-spark-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0085ff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#0085ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.33, 0.66].map((f) => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} className="lk-spark-grid" />
        ))}
        <motion.path
          d={`${d} L${w},${h} L0,${h} Z`}
          fill="url(#lk-spark-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="#0085ff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 1.4, ease: settle }}
        />
        <circle cx={pts[best][0]} cy={pts[best][1]} r="4" fill="#fff" stroke="#e10600" strokeWidth="2.2" />
      </svg>
      <p className="lk-float-foot">
        <span>
          <b>{compact(last)}</b> last week
        </span>
        <span className={up >= 0 ? 'is-up' : 'is-down'}>
          {up >= 0 ? '▲' : '▼'} {Math.abs(up)}% vs avg
        </span>
      </p>
    </Rise>
  )
}

// the notification bell keeps ringing — one new item every few seconds
const NOTES = (() => {
  const latest = [...posts].sort((a, b) => b.date.localeCompare(a.date))[0]
  const short = latest ? latest.hook.replace(/[“”"]/g, '').slice(0, 30).trim() + '…' : ''
  const followers = season.totals.find((t) => t.label === 'New followers')?.value
  return [
    latest && { icon: '👏', bg: '#eaf6e4', text: <><b>{latest.reactions.toLocaleString('en-US')}</b> people reacted to your latest post</> },
    latest && { icon: '💬', bg: '#f1ecfb', text: <><b>{latest.comments}</b> comments on “{short}”</> },
    followers && { icon: '➕', bg: '#e8f1fb', text: <><b>{followers}</b> new followers this season</> },
    { icon: '🔥', bg: '#fff1e6', text: <>Your posts passed <b>1M</b> impressions</> },
    { icon: '✍️', bg: '#fdf3d9', text: <>New post: <b>{latest ? latest.topic : 'design'}</b> — out now</> },
  ].filter(Boolean)
})()

function Notifications() {
  const reduce = useReducedMotion()
  const [n, setN] = useState(3)

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setN((v) => v + 1), 3200)
    return () => clearInterval(t)
  }, [reduce])

  const shown = [0, 1, 2].map((k) => ({ id: n - k, ...NOTES[(n - k) % NOTES.length] }))

  return (
    <div className="lk-float lk-notes" aria-hidden="true">
      <p className="lk-float-top">
        <span>Notifications</span>
        <b className="lk-bell">
          <motion.i key={n} initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
            {(n % 9) + 1}
          </motion.i>
        </b>
      </p>
      <ul>
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((s, i) => (
            <motion.li
              key={s.id}
              layout
              className={i === 0 ? 'is-new' : ''}
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1 - i * 0.3, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            >
              <span className="lk-note-icon" style={{ background: s.bg }}>
                {s.icon}
              </span>
              <span className="lk-note-text">{s.text}</span>
              {i === 0 && <em>now</em>}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

function Profile() {
  const followers = season.totals.find((t) => t.label === 'New followers')?.value
  const postCount = season.totals.find((t) => t.label === 'Posts')?.value
  return (
    <Rise className="lk-float lk-profile" play delay={0.65}>
      <div className="lk-profile-cover" aria-hidden="true">
        <span className="lk-kerb" />
      </div>
      <div className="lk-profile-row">
        <img className="lk-profile-avatar" src={author.avatar} alt="" />
        <span className="lk-open" aria-hidden="true">
          <i /> Open to work
        </span>
      </div>
      <p className="lk-profile-name">
        {author.name} <span className="lk-verified" aria-hidden="true">✓</span>
      </p>
      <p className="lk-profile-role">Product Designer · Pune, India</p>
      <dl className="lk-profile-stats">
        <div>
          <dt>Posts</dt>
          <dd>{postCount}</dd>
        </div>
        <div>
          <dt>Followers</dt>
          <dd>{followers}</dd>
        </div>
        <div>
          <dt>Reach</dt>
          <dd>1M+</dd>
        </div>
      </dl>
      <a className="lk-btn" href={LINKEDIN_PROFILE} target="_blank" rel="noreferrer">
        <InIcon /> Follow
      </a>
    </Rise>
  )
}

/* the sticker: photo + border baked into one image, with the Figma "!" lines and badge */
function Sticker({ x, y }) {
  const reduce = useReducedMotion()
  const [bursts, setBursts] = useState([])
  const [count, setCount] = useState(0)
  const id = useRef(0)

  const react = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX ? e.clientX - r.left : r.width / 2
    const y = e.clientY ? e.clientY - r.top : r.height / 3
    const batch = Array.from({ length: reduce ? 1 : 7 }, (_, i) => ({
      id: ++id.current,
      x,
      y,
      dx: (Math.random() - 0.5) * 220,
      dy: -120 - Math.random() * 160,
      r: (Math.random() - 0.5) * 60,
      re: REACTIONS[(id.current + i) % REACTIONS.length],
    }))
    setBursts((b) => [...b.slice(-28), ...batch])
    setCount((c) => c + 1)
  }

  return (
    <div className="lk-sticker">
      <span className="lk-halo" aria-hidden="true">
        <i />
      </span>
      <span className="lk-floor" aria-hidden="true" />
      <motion.div className="lk-sticker-move" style={{ x, y }}>
      <motion.button
        type="button"
        className="lk-sticker-hit"
        onClick={react}
        aria-label="Send a reaction"
        whileHover={reduce ? undefined : { scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.2 }}
      >
        <img
          className="lk-sticker-pic"
          src="/images/content/pratik-sticker-full.webp"
          width="1396"
          height="1602"
          alt="Pratik Mahajan"
          fetchPriority="high"
          draggable="false"
        />
      </motion.button>
      </motion.div>

      {/* Figma "Line 279–281": the excited marks above the head */}
      <span className="lk-sticker-lines" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.img
            key={i}
            src={`/images/content/line-${i + 1}.svg`}
            alt=""
            style={{ rotate: [-70, -59, -49][i] }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.75 + i * 0.08, ease: settle }}
          />
        ))}
      </span>

      <motion.span
        className="lk-sticker-badge"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 10.79 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.95 }}
        whileHover={{ rotate: -6, scale: 1.08 }}
      >
        <img src="/images/content/linkedin-badge.svg" alt="" />
      </motion.span>

      <motion.p
        className="lk-sticker-hint"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: count ? 0 : 1 }}
        transition={{ delay: count ? 0 : 1.8 }}
      >
        <svg viewBox="0 0 60 40">
          <path d="M4 34 C 18 30, 34 22, 50 8" />
          <path d="M40 8 L 50 8 L 49 18" />
        </svg>
        tap to react
      </motion.p>

      <AnimatePresence>
        {count > 0 && (
          <motion.p
            key="count"
            className="lk-sticker-count"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
          >
            <span className="lk-reacts">
              {REACTIONS.slice(0, 3).map((r) => (
                <i key={r.k} style={{ background: r.bg }}>
                  {r.icon}
                </i>
              ))}
            </span>
            You and <b>{(21400 + count).toLocaleString('en-US')}</b> others
          </motion.p>
        )}
      </AnimatePresence>

      <span className="lk-bursts" aria-hidden="true">
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.i
              key={b.id}
              style={{ left: b.x, top: b.y, background: b.re.bg }}
              initial={{ x: '-50%', y: '-50%', scale: 0.3, opacity: 1 }}
              animate={{ x: `calc(-50% + ${b.dx}px)`, y: `calc(-50% + ${b.dy}px)`, scale: 1, rotate: b.r, opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.2, 0.7, 0.3, 1] }}
              onAnimationComplete={() => setBursts((all) => all.filter((x) => x.id !== b.id))}
            >
              {b.re.icon}
            </motion.i>
          ))}
        </AnimatePresence>
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ the work: the posts themselves */

function Work() {
  const topics = useMemo(() => ['All', ...new Set(posts.map((p) => p.topic))], [])
  const [topic, setTopic] = useState('All')
  const list = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)).filter((p) => topic === 'All' || p.topic === topic),
    [topic],
  )
  // the newest post runs double-width only when that leaves the three-column grid with full rows
  const hasEmbeds = posts.some((p) => p.embed)
  const featured = !hasEmbeds && topic === 'All' && list.length % 3 === 2

  return (
    <section className="lk-sec lk-work" aria-labelledby="lk-work-title">
      <SecHead n="01" label="The work" sub="carousels, breakdowns and notes from the feed" title="Posts I’ve made" id="lk-work-title" />

      {topics.length > 2 && (
      <div className="lk-chips" role="tablist" aria-label="Filter posts by topic">
        <LayoutGroup id="lk-chips">
          {topics.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={topic === t} className={topic === t ? 'is-on' : ''} onClick={() => setTopic(t)}>
              {topic === t && <motion.span layoutId="lk-chip-pill" className="lk-chip-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span>{t}</span>
            </button>
          ))}
        </LayoutGroup>
      </div>
      )}

      <motion.ul layout className={`lk-wall${featured ? ' is-featured' : ''}${hasEmbeds ? ' has-embeds' : ''}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p, i) => (
            <motion.li
              key={p.id}
              layout
              className={featured && i === 0 ? 'is-big' : ''}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              {p.embed ? <EmbedTile p={p} delay={i * 0.06} /> : <PostTile p={p} big={featured && i === 0} delay={i * 0.06} />}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  )
}

// the real LinkedIn post as a preview card: LinkedIn's collapsed view (two lines of text + the
// image), rendered at its native 504px and scaled to the card, clipped to one height; click opens the post
const EMBED_W = 504
const collapsed = (src) => (src.includes('collapsed=') ? src : `${src}${src.includes('?') ? '&' : '?'}collapsed=1`)

function EmbedTile({ p, delay }) {
  const box = useRef(null)
  const [ready, setReady] = useState(false)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = box.current
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / EMBED_W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Rise className="lk-tile-wrap" delay={delay}>
      <a className="lk-embed" href={postUrl(p)} target="_blank" rel="noreferrer" aria-label={`${p.hook} — open on LinkedIn`}>
        <span ref={box} className={`lk-embed-frame${ready ? ' is-ready' : ''}`}>
          {!ready && (
            <span className="lk-embed-wait" aria-hidden="true">
              <InIcon /> Loading…
            </span>
          )}
          {scale > 0 && (
            <iframe
              src={collapsed(p.embed)}
              title={`LinkedIn post: ${p.hook}`}
              loading="lazy"
              tabIndex={-1}
              style={{ transform: `scale(${scale})` }}
              onLoad={() => setReady(true)}
            />
          )}
          <span className="lk-embed-fade" aria-hidden="true" />
          <span className="lk-tile-open" aria-hidden="true">
            <InIcon /> View post
          </span>
        </span>
        <span className="lk-tile-meta">
          <span className="lk-tile-tag">
            <i className="lk-topic lk-topic--navy" />
            {p.topic}
          </span>
          <span className="lk-tile-date">{fmtDate(p.date)}</span>
        </span>
      </a>
    </Rise>
  )
}

function PostTile({ p, big, delay }) {
  return (
    <Rise className="lk-tile-wrap" delay={delay}>
      <a className={`lk-tile${big ? ' is-big' : ''} is-${p.format}`} href={postUrl(p)} target="_blank" rel="noreferrer" aria-label={`${p.hook} — open on LinkedIn`}>
        <span className="lk-tile-frame">
          {/* a carousel peeks its next slides out from behind */}
          {p.format === 'carousel' && (
            <>
              <span className="lk-tile-peek lk-tile-peek--2" aria-hidden="true" />
              <span className="lk-tile-peek lk-tile-peek--1" aria-hidden="true" />
            </>
          )}
          <span className="lk-tile-cover">
            <Thumb p={p} />
            <span className="lk-tile-open" aria-hidden="true">
              <InIcon /> View post
            </span>
          </span>
        </span>
        <span className="lk-tile-meta">
          <span className="lk-tile-tag">
            <i className={`lk-topic lk-topic--${COVERS[posts.indexOf(p) % COVERS.length]}`} />
            {p.topic}
          </span>
          <span className="lk-tile-date">{fmtDate(p.date)}</span>
        </span>
        <span className="lk-tile-hook">{p.hook}</span>
      </a>
    </Rise>
  )
}

/* ------------------------------------------------------------------ 04 · follow */

// the chequered flag: a full-width black finish panel, like the stats bar under the hero
function FollowCard() {
  const topics = [...new Set(posts.map((p) => p.topic))].slice(0, 3)
  const followers = season.totals.find((t) => t.label === 'New followers')?.value
  return (
    <section className="lk-finish" aria-labelledby="lk-follow-title">
      <span className="lk-finish-flag lk-finish-flag--l" aria-hidden="true" />
      <span className="lk-finish-flag lk-finish-flag--r" aria-hidden="true" />

      <div className="lk-finish-in">
        <Rise as="p" className="lk-label lk-finish-label">
          <i className="lk-live" /> Season 01 · still running
        </Rise>
        <Rise as="h2" id="lk-follow-title" className="lk-finish-title" delay={0.05}>
          See you on the <em>feed.</em>
        </Rise>
        <Rise as="p" className="lk-finish-sub" delay={0.1}>
          Design breakdowns, UX teardowns and the honest bits of building in public.
        </Rise>
        <Rise className="lk-finish-btns" delay={0.15}>
          <a className="lk-btn lk-btn--light" href={LINKEDIN_PROFILE} target="_blank" rel="noreferrer">
            <InIcon /> Follow on LinkedIn
          </a>
          <a className="lk-finish-link" href={`${LINKEDIN_PROFILE}recent-activity/all/`} target="_blank" rel="noreferrer">
            All posts <span aria-hidden="true">↗</span>
          </a>
        </Rise>

        <Rise as="dl" className="lk-finish-info" delay={0.2}>
          <div>
            <dt>Cadence</dt>
            <dd>Most weeks</dd>
          </div>
          <div>
            <dt>On track</dt>
            <dd>{topics.join(' · ')}</dd>
          </div>
          {followers && (
            <div>
              <dt>Joined this season</dt>
              <dd>{followers}</dd>
            </div>
          )}
        </Rise>
      </div>
    </section>
  )
}

/* shared section heading: number, label, title, and anything on the right */
function SecHead({ n, label, sub, title, id, children }) {
  return (
    <div className="lk-sec-head">
      <div>
        <p className="lk-label">
          <span className="lk-sec-n">{n}</span>
          <b>{label}</b>
          <span className="lk-label-sub">· {sub}</span>
        </p>
        <h2 id={id} className="lk-h2">
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ bits */

const InIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="lk-in">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.9c0-1.17-.02-2.68-1.63-2.68-1.64 0-1.89 1.28-1.89 2.6V21h-4V9.75Z" />
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
