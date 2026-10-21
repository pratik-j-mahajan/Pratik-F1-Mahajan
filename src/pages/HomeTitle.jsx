import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useRaceStart, warmMap } from './Home.jsx'
import '../styles/home-title.css'

/*
  Alternate home, "title card" — a driver title poster on #F6F5F1: the surname set huge in tall
  condensed type, the driver standing in front of it, a dark-red band across his chest carrying the
  details, then the country, a tagline and a signature underneath. START bottom-right.
  Shown with ?home=title; the original home is untouched.
*/
const ease = [0.22, 1, 0.36, 1]
const rise = (delay, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease },
})

export default function HomeTitle() {
  const reduce = useReducedMotion()
  const race = useRaceStart()

  useEffect(() => {
    const t = setTimeout(() => warmMap('low'), 1800)
    return () => clearTimeout(t)
  }, [])

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
    <section className={`htc${race.running ? ' is-starting' : ''}`}>
      {/* poster furniture: crop marks round the artboard, a giant outlined race number, a halftone halo */}
      <span className="htc-crop" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <motion.span
        className="htc-num"
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, delay: 0.2, ease }}
      >
        06
      </motion.span>
      <motion.span
        className="htc-halo"
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease }}
      />

      {/* the surname's outline echo, offset behind it like a misregistered print */}
      <motion.div
        className="htc-echo"
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, x: -14, y: -14 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease }}
      >
        <svg viewBox="0 0 640 300" preserveAspectRatio="none">
          <text x="0" y="296" textLength="640" lengthAdjust="spacingAndGlyphs">
            MAHAJAN
          </text>
        </svg>
      </motion.div>

      {/* the surname: set to exactly the band's width and stretched tall (SVG textLength) */}
      <motion.h1
        className="htc-name"
        aria-label="Pratik Mahajan"
        initial={reduce ? false : { clipPath: 'inset(100% 0 0 0)' }}
        animate={{ clipPath: 'inset(0% 0 -2% 0)' }}
        transition={{ duration: 1, ease: [0.7, 0, 0.2, 1] }}
      >
        <svg viewBox="0 0 640 300" preserveAspectRatio="none" aria-hidden="true">
          <text x="0" y="296" textLength="640" lengthAdjust="spacingAndGlyphs">
            MAHAJAN
          </text>
        </svg>
      </motion.h1>

      {/* marks above the band */}
      <motion.img className="htc-f1" src="/images/f1-logo-red.svg" alt="F1" {...rise(0.4, 10)} />
      <motion.img className="htc-pm" src="/icon-512.png" alt="PM" {...rise(0.45, 10)} />

      {/* the band */}
      <motion.div
        className="htc-band"
        initial={reduce ? false : { clipPath: 'inset(0 50% 0 50%)' }}
        animate={{ clipPath: 'inset(0 0% 0 0%)' }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.7, 0, 0.2, 1] }}
      >
        <p className="htc-full">Pratik Mahajan</p>
        <p className="htc-side">
          Product
          <br />
          Designer
        </p>
        <div className="htc-bio">
          <p className="htc-code">PM06</p>
          <p>
            Pratik finds the small frictions in everyday apps and designs calm, simple fixes. Research first, every
            screen intentional — from the first sketch to the final UI.
          </p>
        </div>
      </motion.div>

      {/* a kerb along the band's foot, and a barcode tag under its left end */}
      <motion.span
        className="htc-kerb"
        aria-hidden="true"
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.7, ease: [0.7, 0, 0.2, 1] }}
      />
      <motion.p className="htc-code-tag" aria-hidden="true" {...rise(0.9, 8)}>
        <span className="htc-bars" />
        PM-06 · 2026
      </motion.p>

      {/* right: the season in numbers */}
      <motion.dl className="htc-stats" {...rise(0.6, 16)}>
        <div>
          <dt>LinkedIn reach</dt>
          <dd>1M+</dd>
        </div>
        <div>
          <dt>Case studies</dt>
          <dd>02</dd>
        </div>
        <div>
          <dt>Graduating</dt>
          <dd>’26</dd>
        </div>
      </motion.dl>

      {/* the driver, in front of the name and the band */}
      <motion.img className="htc-driver" src="/images/driver.webp" alt="Pratik Mahajan" {...rise(0.2, 30)} />

      {/* under the band: country, tagline, signature */}
      <motion.p className="htc-country" {...rise(0.6, 10)}>
        India
      </motion.p>
      <motion.p className="htc-tag" {...rise(0.7, 10)}>
        <span>
          The
          <br />
          Product
        </span>
        Designer
      </motion.p>
      <motion.span
        className="htc-sign"
        aria-hidden="true"
        initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 -10% 0 0)' }}
        transition={{ duration: 1.2, delay: 1.1, ease: 'easeInOut' }}
      >
        Pratik M.
      </motion.span>

      {/* bottom-left: availability */}
      <motion.div className="htc-open" {...rise(0.8, 10)}>
        <p className="htc-open-tag">
          <i aria-hidden="true" /> Open to work
        </p>
        <p className="htc-open-role">Product Designer</p>
        <p className="htc-open-meta">Full-time · Internships · Remote / Pune</p>
      </motion.div>

      {/* top-left caption, like a poster's edition line */}
      <motion.p className="htc-edition" {...rise(0.5, 10)}>
        Portfolio GP <b>2026</b>
        <br />
        Season edition · Nº 06
      </motion.p>

      {/* START, bottom-right */}
      <motion.div className="htc-start-wrap" {...rise(0.85)}>
        <span className="htc-lights" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} style={{ '--i': i }} className={i < race.lit ? 'is-on' : undefined} />
          ))}
        </span>
        <Link
          to="/map"
          className="htc-start"
          onPointerEnter={() => warmMap('high')}
          onFocus={() => warmMap('high')}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
            e.preventDefault()
            race.start()
          }}
        >
          Start
          <span className="sr-only"> the portfolio tour</span>
          <span aria-hidden="true">→</span>
        </Link>
      </motion.div>
    </section>
  )
}
