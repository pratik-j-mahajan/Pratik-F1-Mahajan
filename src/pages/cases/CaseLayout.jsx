import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useOutlet } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import BackButton from '../../components/BackButton.jsx'
import { BEHANCE_PROFILE } from '../../data/caseStudies.js'
import '../../styles/cases.css'

const WIPE = { duration: 0.75, ease: [0.7, 0, 0.2, 1] }

export default function CaseLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduce = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)

  // page changes inside the case studies get a red wipe; the first arrival doesn't
  const [entry] = useState(location.pathname)
  const navigated = useRef(false)
  // opening a project flies its visual into the cover — that already is the transition, no wipe on top
  const animateCut = !reduce && !location.state?.from && (navigated.current || location.pathname !== entry)
  // (scroll position is handled app-wide by ScrollManager, so refreshes keep their place)
  useLayoutEffect(() => {
    if (location.pathname !== entry) navigated.current = true
  }, [location.pathname, entry])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="cw pj">
      <header className={`cw-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="cw-nav-left">
          <BackButton />
          <Link to="/case-study" className="cw-brand">
            <img src="/images/f1-logo-white.svg" alt="" />
            <span>Case studies</span>
          </Link>
        </div>
        <nav className="cw-nav-right">
          <a href={BEHANCE_PROFILE} target="_blank" rel="noreferrer" className="cw-link">
            Behance <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <motion.div
        key={location.pathname}
        className="cw-main"
        initial={animateCut ? { clipPath: 'inset(0 100% 0 0)' } : false}
        animate={{ clipPath: 'inset(0 0% 0 0)', transitionEnd: { clipPath: 'none' } }}
        transition={WIPE}
      >
        {outlet}
      </motion.div>

      {animateCut && (
        <motion.span
          key={`wipe-${location.pathname}`}
          className="cw-wipe"
          initial={{ x: '-30vw' }}
          animate={{ x: '130vw' }}
          transition={WIPE}
          aria-hidden="true"
        >
          <i />
          <i />
        </motion.span>
      )}
    </div>
  )
}
