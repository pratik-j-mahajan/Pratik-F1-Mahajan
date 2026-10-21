import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useRaceStart, warmMap } from './Home.jsx'
import '../styles/home-poster.css'

/*
  Alternate home, "poster" — the reference poster rebuilt as a centred column (same 1125 × 2000
  proportions, every piece placed where it sits in the reference), on #F6F5F1 paper. The empty
  sides carry what I'm open to (left) and a little about me (right); START sits bottom-right.
  Shown with ?home=poster; the original home is untouched.
*/
const ease = [0.22, 1, 0.36, 1]
const rise = (delay, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease },
})

export default function HomePoster() {
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
    <section className={`hpo${race.running ? ' is-starting' : ''}`}>
      {/* ---------- the poster column ---------- */}
      <div className="hpo-col">
        <motion.div className="hpo-marks" {...rise(0.1, -10)}>
          <img className="hpo-pm" src="/icon-512.png" alt="PM" />
          <img className="hpo-f1" src="/images/f1-logo-red.svg" alt="F1" />
          <img className="hpo-flag" src="/images/flag-india.svg" alt="India" />
        </motion.div>

        <motion.blockquote className="hpo-quote" {...rise(0.25)}>
          <p>
            “I find UX problems in everyday apps.
            <br />
            Then I design simple fixes —
            <br />
            calm, clear, and quick to use.”
          </p>
          <cite>- Pratik Mahajan</cite>
        </motion.blockquote>

        <motion.span
          className="hpo-block"
          aria-hidden="true"
          initial={reduce ? false : { clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 1, delay: 0.1, ease: [0.7, 0, 0.2, 1] }}
        />
        <motion.h1 className="hpo-name" {...rise(0.35, 0)}>
          <span>
            <em>Pratik</em> Mahajan
          </span>
        </motion.h1>

        <motion.img className="hpo-back" src="/images/driver.webp" alt="" {...rise(0.25)} />
        <motion.img className="hpo-helmet" src="/images/alt-helmet.webp" alt="" {...rise(0.55)} />
        <motion.img className="hpo-front" src="/images/alt-me.webp" alt="Pratik Mahajan" {...rise(0.45)} />

        <motion.span
          className="hpo-sign"
          aria-hidden="true"
          initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 -10% 0 0)' }}
          transition={{ duration: 1.2, delay: 1, ease: 'easeInOut' }}
        >
          Pratik M.
        </motion.span>
      </div>

      {/* ---------- left: what I'm open to ---------- */}
      <motion.div className="hpo-side hpo-side--left" {...rise(0.6)}>
        <p className="hpo-open">
          <i aria-hidden="true" /> Open to work
        </p>
        <h2>
          Product
          <br />
          Designer
        </h2>
        <p className="hpo-also">UI/UX · Product · Visual design</p>
        <ul>
          <li>Full-time roles</li>
          <li>Internships</li>
          <li>Remote / Pune</li>
        </ul>
      </motion.div>

      {/* ---------- right: about me ---------- */}
      <motion.div className="hpo-side hpo-side--right" {...rise(0.7)}>
        <p className="hpo-label">About</p>
        <p className="hpo-bio">
          B.Tech CSE ’26 from Pune, India. I study how people use everyday apps, find where they get stuck, and design
          calm, simple fixes — from research to final UI.
        </p>
        <dl className="hpo-facts">
          <div>
            <dt>Reach</dt>
            <dd>1M+</dd>
          </div>
          <div>
            <dt>Case studies</dt>
            <dd>02</dd>
          </div>
        </dl>
      </motion.div>

      {/* ---------- START, bottom-right ---------- */}
      <motion.div className="hpo-start-wrap" {...rise(0.8)}>
        <span className="hpo-lights" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} style={{ '--i': i }} className={i < race.lit ? 'is-on' : undefined} />
          ))}
        </span>
        <Link
          to="/map"
          className="hpo-start"
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
        <p className="hpo-key" aria-hidden="true">
          or press <kbd>Enter</kbd>
        </p>
      </motion.div>
    </section>
  )
}
