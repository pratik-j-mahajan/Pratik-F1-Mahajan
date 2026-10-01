import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { profile } from '../../../data/about.js'
import { Lines, Rise, ease } from '../../reveal.jsx'
import LowerThird from '../../LowerThird.jsx'

const FLIGHT = { duration: 1, ease }

function useClock(timeZone) {
  const fmt = useMemo(() => new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }), [timeZone])
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const t = setInterval(() => setNow(fmt.format(new Date())), 5000)
    return () => clearInterval(t)
  }, [fmt])
  return now
}

/*
  `from` is where the photo sat on the scanned pass. When it's set, the photo lifts off
  the card and lands in the frame — the pass you just scanned becomes the profile.
*/
export default function Hero({ from, delay = 0 }) {
  const time = useClock(profile.timeZone)
  const d = delay
  const lines = profile.headline

  return (
    <section className="abx-hero" aria-label="About">
      <div className="abx-hero-copy">
        <Rise as="p" className="ab-label" play delay={d}>
          <span>{profile.number}</span> — About
        </Rise>
        <Lines
          as="h1"
          className="abx-title"
          play
          delay={d + 0.05}
          stagger={0.08}
          aria-label={`${lines.join(' ')}.`}
          lines={[
            ...lines.slice(0, -1),
            <>
              {lines.at(-1)}
              <i>.</i>
            </>,
          ]}
        />
        <Rise as="p" className="abx-intro" play delay={d + 0.35}>
          {profile.intro}
        </Rise>
        <Rise className="abx-actions" play delay={d + 0.45}>
          <a className="ab-btn ab-btn--red" href="/resume.pdf" download>
            Download résumé
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 2v9M4 7.5 8 11.5 12 7.5M3 14h10" />
            </svg>
          </a>
          <Link className="ab-link" to="/case-study">
            See the work <span aria-hidden="true">→</span>
          </Link>
        </Rise>
        <Rise as="dl" className="abx-facts" play delay={d + 0.55}>
          <div>
            <dt>Based in</dt>
            <dd>{profile.base}</dd>
          </div>
          <div>
            <dt>Local time</dt>
            <dd>
              <span className="abx-live" aria-hidden="true" />
              {time} IST
            </dd>
          </div>
          <div className="abx-facts-now">
            <dt>Currently</dt>
            <dd>{profile.now}</dd>
          </div>
        </Rise>
      </div>

      <Photo from={from} delay={d} />
    </section>
  )
}

function Photo({ from, delay }) {
  const reduce = useReducedMotion()
  const frame = useRef(null)
  const fly = Boolean(from) && !reduce
  const [to, setTo] = useState(null)
  const [landed, setLanded] = useState(!fly)

  useLayoutEffect(() => {
    if (!fly) return
    const r = frame.current.getBoundingClientRect()
    setTo({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [fly])

  // never leave the frame empty, even if the flight is interrupted
  useEffect(() => {
    if (!fly) return
    const t = setTimeout(() => setLanded(true), 1600)
    return () => clearTimeout(t)
  }, [fly])

  return (
    <div className="abx-photo-wrap">
      <div className="abx-photo" ref={frame} style={{ visibility: landed ? 'visible' : 'hidden' }}>
        <motion.div
          className="abx-photo-clip"
          initial={fly || reduce ? false : { clipPath: 'inset(0% 0% 0% 100%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1, delay, ease }}
        >
          <motion.img
            src={profile.photo}
            alt={`${profile.first} ${profile.last}`}
            width="540"
            height="720"
            initial={fly || reduce ? false : { scale: 1.25 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.3, delay, ease }}
          />
        </motion.div>
      </div>

      <LowerThird
        className="abx-lt"
        num={profile.number}
        title={
          <>
            <span className="abx-lt-first">{profile.first}</span> {profile.last}
          </>
        }
        sub={profile.role}
        tail={
          <>
            <img src="/images/flag-india-round.svg" alt="" />
            {profile.country}
          </>
        }
        play={landed}
        delay={fly ? 0 : delay + 0.75}
      />

      {fly &&
        to &&
        !landed &&
        createPortal(
          <motion.div
            className="abx-flight"
            initial={{ ...from, borderRadius: 8 }}
            animate={{ ...to, borderRadius: 20 }}
            transition={FLIGHT}
            onAnimationComplete={() => setLanded(true)}
            aria-hidden="true"
          >
            <img src={profile.photo} alt="" />
          </motion.div>,
          document.body,
        )}
    </div>
  )
}
