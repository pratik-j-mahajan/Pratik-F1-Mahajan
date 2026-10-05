import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import sections from '../data/sections.js'
import useParallax from '../hooks/useParallax.js'
import useMusic from '../hooks/useMusic.js'
import { prefetchAllSectionVideos, prefetchSectionVideo, useSectionTransition } from '../components/SectionTransition.jsx'
import {
  ArrowIcon,
  ListIcon,
  MapIcon,
  MoonIcon,
  MusicOffIcon,
  MusicOnIcon,
  SunIcon,
} from '../components/MapIcons.jsx'
import '../styles/map.css'

// How far (px) the map drifts at the screen edges.
const MAP_SHIFT = 14
const ease = [0.22, 1, 0.36, 1]

export default function Map() {
  const [night, setNight] = useState(false)
  const [view, setView] = useState('map')
  const [activeId, setActiveId] = useState(null)
  // the section card keeps showing the last section you pointed at
  const [cardId, setCardId] = useState(sections[0].id)
  const navigate = useNavigate()

  // once the map has settled, start downloading the section videos in the background
  useEffect(() => {
    const t = setTimeout(() => prefetchAllSectionVideos(sections.map((s) => s.video)), 1500)
    return () => clearTimeout(t)
  }, [])
  const music = useMusic()
  const parallax = useParallax(MAP_SHIFT)
  const playTransition = useSectionTransition()

  // Links keep their href (new tab, accessibility), but a normal click plays the video first.
  const openSection = (s) => (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    if (music.playing) music.toggle()
    playTransition(s)
  }

  const active = sections.find((s) => s.id === activeId)
  const point = (id) => {
    prefetchSectionVideo(sections.find((x) => x.id === id)?.video)
    setActiveId(id)
    if (id) setCardId(id)
  }
  const cardIndex = sections.findIndex((s) => s.id === cardId)
  const card = sections[cardIndex]
  const isList = view === 'list'

  return (
    <motion.section
      className={`map-page${night ? ' is-night' : ''}`}
      onMouseMove={parallax.onMouseMove}
      onMouseLeave={parallax.onMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Circuit map (day + night stacked, crossfaded) */}
      <motion.div
        className="map-layer"
        style={{ x: parallax.x, y: parallax.y, scale: 1.05 }}
        animate={{ filter: isList ? 'blur(6px) brightness(0.55)' : 'blur(0px) brightness(1)' }}
        transition={{ duration: 0.5 }}
      >
        <img className="map-img" src="/images/map-day.webp" alt="Circuit map" />
        <motion.img
          className="map-img"
          src="/images/map-night.webp"
          alt=""
          initial={false}
          animate={{ opacity: night ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        />

        {/* a light shade so the markers read against the busy aerial photo */}
        {!isList && <span className="map-shade" aria-hidden="true" />}

        {!isList &&
          sections.map((s, i) => (
            <Link
              key={s.id}
              to={s.path}
              onClick={openSection(s)}
              className={`map-pin${s.pin.align ? ` is-${s.pin.align}` : ''}${activeId === s.id ? ' is-active' : ''}`}
              style={{ left: `${s.pin.x}%`, top: `${s.pin.y}%` }}
              onMouseEnter={() => point(s.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => point(s.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="map-pin-label">
                <span className="map-pin-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="map-pin-text">
                  <b>{s.title}</b>
                  <small>{s.turn}</small>
                </span>
              </span>
              <span className="map-pin-stem" aria-hidden="true" />
              <span className="map-pin-dot" aria-hidden="true" />
            </Link>
          ))}
      </motion.div>

      {/* Left sidebar */}
      <aside className="map-sidebar">
        <div className="side-head">
          <button type="button" className="side-back" onClick={() => navigate('/')} aria-label="Back to home">
            <svg viewBox="0 0 12.485 11.93" aria-hidden="true">
              <path d="M6.117 11.465L.66 5.965 6.117.465M1.418 5.965h11.067" />
            </svg>
          </button>
          <Link to="/" className="side-logo" aria-label="Home">
            <img src="/images/f1-logo-white-map.svg" alt="F1" />
          </Link>
        </div>

        <div className="profile">
          <p className="profile-country">
            INDIA <img src="/images/flag-india-round.svg" alt="" />
          </p>
          <p className="profile-number" aria-hidden="true">06</p>
          <div className="profile-driver">
            <img src="/images/driver.webp" alt="Pratik Mahajan" />
          </div>
          <span className="profile-fade" aria-hidden="true" />
          <p className="profile-name">Pratik Mahajan</p>
          <p className="profile-role">Product Designer</p>
        </div>

        <nav className="menu-card" aria-label="Sections">
          {sections.map((s) => (
            <Link
              key={s.id}
              to={s.path}
              onClick={openSection(s)}
              className={`menu-row${activeId === s.id ? ' is-active' : ''}`}
              onMouseEnter={() => point(s.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => point(s.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="menu-title">{s.title}</span>
              <span className="menu-turn">{s.turn}</span>
              <Chevron className="menu-arrow" />
            </Link>
          ))}
        </nav>

        <a className="resume-btn" href="/resume.pdf" download>
          Download Resume
        </a>

        <div className="social-row">
          <a className="social-chip" href="#" target="_blank" rel="noreferrer">
            <img src="/images/icons/linkedin.svg" alt="" />
            Linkedin
          </a>
          <a className="social-chip" href="#" target="_blank" rel="noreferrer">
            <img src="/images/icons/behance.svg" alt="" />
            Behance
          </a>
          <a className="social-chip" href="#" target="_blank" rel="noreferrer">
            <img src="/images/icons/instagram.svg" alt="" />
            instagram
          </a>
        </div>
      </aside>

      {/* Section card (bottom right) — shows the last section pointed at */}
      {!isList && (
        <div className="section-card">
          {/* the card itself stays put; only the words change — the name rolls like a timing board */}
          <div className="section-card-head">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={card.id}
                className="section-card-roll"
                initial={{ y: '105%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-105%' }}
                transition={{ duration: 0.38, ease: [0.7, 0, 0.2, 1] }}
              >
                {/* long names shrink to fit the strip (font size scales with the character count) */}
                <p className="section-card-title" style={{ '--chars': card.title.length }}>
                  {card.title}
                </p>
                <p className="section-card-turn">
                  {card.turn.toUpperCase()} - {String(cardIndex + 1).padStart(2, '0')}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="section-card-body">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={card.id}
                className="section-card-blurb"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {card.blurb}
              </motion.p>
            </AnimatePresence>
          </div>
          <Link to={card.path} onClick={openSection(card)} className="section-card-open">
            Open Section <Chevron className="section-card-arrow" />
          </Link>
        </div>
      )}

      {/* Circuit info (reacts to hovered section) */}
      <div className="map-info">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active ? active.id : 'default'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <p className="map-info-label">{active ? active.turn : 'Portfolio Grand Prix'}</p>
            <p className="map-info-title">{active ? active.title : 'Lap 1 · 5 Sections'}</p>
            <p className="map-info-sub">{active ? active.blurb : 'Pick a turn on the track to explore'}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right controls */}
      <div className="map-controls">
        <button
          type="button"
          className={`map-ctrl${music.playing ? ' is-on' : ''}`}
          onClick={music.toggle}
          aria-pressed={music.playing}
          aria-label={music.playing ? 'Turn music off' : 'Turn music on'}
          data-tip={music.playing ? 'Music on' : 'Music off'}
        >
          {music.playing ? <MusicOnIcon /> : <MusicOffIcon />}
          {music.playing && (
            <span className="eq" aria-hidden="true">
              <i /><i /><i />
            </span>
          )}
        </button>
        <button
          type="button"
          className="map-ctrl"
          onClick={() => setNight((n) => !n)}
          aria-pressed={night}
          aria-label={night ? 'Switch to day map' : 'Switch to night map'}
          data-tip={night ? 'Night' : 'Day'}
        >
          {night ? <MoonIcon /> : <SunIcon />}
        </button>
        <button
          type="button"
          className="map-ctrl"
          onClick={() => setView(isList ? 'map' : 'list')}
          aria-pressed={isList}
          aria-label={isList ? 'Show map view' : 'Show list view'}
          data-tip={isList ? 'List view' : 'Map view'}
        >
          {isList ? <ListIcon /> : <MapIcon />}
        </button>
      </div>

      {/* List view */}
      <AnimatePresence>
        {isList && (
          <motion.div
            className="map-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {sections.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 * i, ease }}
              >
                <Link
                  to={s.path}
                  onClick={openSection(s)}
                  className={`list-card${activeId === s.id ? ' is-active' : ''}`}
                  onMouseEnter={() => point(s.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <span className="list-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="list-turn">{s.turn}</span>
                  <span className="list-title">{s.title}</span>
                  <span className="list-blurb">{s.blurb}</span>
                  <span className="list-arrow"><ArrowIcon /></span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function Chevron({ className }) {
  return (
    <svg viewBox="0 0 3.5 6.96" className={className} aria-hidden="true">
      <path d="M.45 6.5L2.9 3.48.45.45" />
    </svg>
  )
}
