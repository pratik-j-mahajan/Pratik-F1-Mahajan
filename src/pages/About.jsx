import { useEffect, useState } from 'react'
import { Link, useNavigationType } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import BackButton from '../components/BackButton.jsx'
import PassGate from '../components/about/PassGate.jsx'
import Hero from '../components/about/profile/Hero.jsx'
import { Ticket } from '../components/about/profile/Sections.jsx'
import { MoonIcon, SunIcon } from '../components/MapIcons.jsx'
import '../styles/about.css'
import '../styles/profile.css'

const ease = [0.22, 1, 0.36, 1]

const THEME_KEY = 'about-theme'
const readTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'light'
  } catch {
    return 'light'
  }
}

// Once scanned, a refresh or back/forward keeps you inside; arriving fresh from a link shows the gate.
const PASS_KEY = 'about-pass'
// someone who has scanned (or skipped) once doesn't have to again on later visits
const SEEN_KEY = 'about-pass-seen'
const hasPass = () => {
  try {
    return sessionStorage.getItem(PASS_KEY) === '1' || localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export default function About() {
  const navType = useNavigationType()
  const [theme, setTheme] = useState(readTheme)
  const [entered, setEntered] = useState(() => navType === 'POP' && hasPass())
  const [viaGate, setViaGate] = useState(false)
  const [photoFrom, setPhotoFrom] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* private mode: theme just won't be remembered */
    }
  }, [theme])

  // No scrolling until the pass has been scanned
  useEffect(() => {
    if (entered) return
    const html = document.documentElement
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = ''
    }
  }, [entered])

  // top controls: 'top' at the top of the page, tucked while scrolling down, back on scroll up
  const [bar, setBar] = useState('top')
  useEffect(() => {
    if (!entered) return
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < 12) setBar('top')
      else if (y > last + 6) setBar('hidden')
      else if (y < last - 6) setBar('shown')
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [entered])

  const grant = () => {
    // remember where the ID photo is on the pass, and lift it off the card — it flies into the profile
    const photo = document.querySelector('.gate .pf-photo')
    const r = photo?.getBoundingClientRect()
    if (r && r.width > 24) {
      setPhotoFrom({ top: r.top, left: r.left, width: r.width, height: r.height })
      photo.style.visibility = 'hidden'
    }
    try {
      sessionStorage.setItem(PASS_KEY, '1')
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* private mode: the gate just shows again next time */
    }
    setViaGate(true)
    setEntered(true)
  }

  const dark = theme === 'dark'

  return (
    <div className={`about ${dark ? 'theme-dark' : 'theme-light'}${entered ? ` bar-${bar}` : ''}`}>
      {entered && <span className="ab-shade" aria-hidden="true" />}
      {entered ? (
        <>
          <ThemeToggle dark={dark} onToggle={() => setTheme(dark ? 'light' : 'dark')} />
          <BackButton className="about-back" />
        </>
      ) : (
        // the scan screen sits under the same dark bar as the other section pages
        <header className="navbar navbar--page about-nav">
          <BackButton className="navbar-back" />
          <Link to="/" className="navbar-logo" aria-label="Home">
            <img src="/images/f1-logo-red.svg" alt="F1" />
          </Link>
          <ThemeToggle bar dark={dark} onToggle={() => setTheme(dark ? 'light' : 'dark')} />
        </header>
      )}

      <AnimatePresence>
        {!entered && (
          <motion.div
            key="gate"
            className="gate-wrap"
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
            transition={{ duration: 0.7, ease }}
          >
            <PassGate onGranted={grant} />
          </motion.div>
        )}
      </AnimatePresence>

      {entered && (
        <main className="ab">
          {/* the gate fades for 0.7s while the photo flies over — type follows once it's clear */}
          <Hero from={photoFrom} delay={viaGate ? 0.4 : 0.1} />
          <Ticket />
        </main>
      )}
    </div>
  )
}

function ThemeToggle({ dark, onToggle, bar = false }) {
  return (
    <button
      type="button"
      className={`theme-toggle${bar ? ' theme-toggle--bar' : ''}`}
      onClick={onToggle}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
    >
      <span className={`theme-opt${!dark ? ' is-on' : ''}`}>
        <SunIcon /> Light
      </span>
      <span className={`theme-opt${dark ? ' is-on' : ''}`}>
        <MoonIcon /> Dark
      </span>
    </button>
  )
}
