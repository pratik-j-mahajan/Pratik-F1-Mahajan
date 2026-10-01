import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowIcon } from './MapIcons.jsx'
import LowerThird from './LowerThird.jsx'
import sections from '../data/sections.js'

const pad = (n) => String(n).padStart(2, '0')
const VOLUME = 0.5 // section videos play at half volume
const MUTE_KEY = 'section-video-muted'
const readMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

const TransitionContext = createContext(() => {})

// Call with a section to play its video, then open the section page.
export const useSectionTransition = () => useContext(TransitionContext)

export function SectionTransitionProvider({ children }) {
  const navigate = useNavigate()
  const [section, setSection] = useState(null)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef(null)
  const doneRef = useRef(false)
  const [muted, setMuted] = useState(readMuted)

  const toggleSound = () => {
    const next = !muted
    setMuted(next)
    const v = videoRef.current
    if (v) {
      v.muted = next
      v.volume = VOLUME
    }
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0')
    } catch {
      /* fine */
    }
  }

  const play = useCallback((s) => {
    doneRef.current = false
    setProgress(0)
    setSection(s)
  }, [])

  // Open the section underneath, then fade the video away to reveal it.
  const finish = useCallback(() => {
    if (doneRef.current || !section) return
    doneRef.current = true
    navigate(section.path)
    setSection(null)
  }, [navigate, section])

  useEffect(() => {
    if (!section) return
    const video = videoRef.current
    if (video) {
      video.volume = VOLUME
      video.muted = muted
    }
    // A click started this, so sound is allowed; fall back to muted if the browser refuses.
    video?.play().catch(() => {
      video.muted = true
      setMuted(true)
      video.play().catch(finish)
    })
    const onKey = (e) => e.key === 'Escape' && finish()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section, finish]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TransitionContext.Provider value={play}>
      {children}

      <AnimatePresence>
        {section && (
          <motion.div
            key={section.id}
            className="section-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
            transition={{ duration: 0.4 }}
          >
            <video
              ref={videoRef}
              src={section.video}
              playsInline
              preload="auto"
              onEnded={finish}
              onError={finish}
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                if (v.duration) setProgress(v.currentTime / v.duration)
              }}
            />

            {/* F1 TV-style broadcast graphics, kept light */}
            <span className="sv-shade" aria-hidden="true" />
            <motion.div
              className="sv-bug"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <span className="sv-live">
                <i /> Live
              </span>
              <img src="/images/f1tv-logo.svg" alt="F1 TV" />
              <span className="sv-event">Portfolio Grand Prix</span>
            </motion.div>

            <motion.button
              type="button"
              className={`sv-sound${muted ? ' is-muted' : ''}`}
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                {muted ? <path d="m17 9 5 5m0-5-5 5" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
              </svg>
              <span>{muted ? 'Sound off' : 'Sound on'}</span>
              {!muted && (
                <span className="sv-eq" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </motion.button>

            <motion.div
              className="sv-lap"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <span>Lap</span>
              <b>{pad(sections.findIndex((x) => x.id === section.id) + 1)}</b>
              <em>/ {pad(sections.length)}</em>
            </motion.div>

            <LowerThird
              className="sv-lt"
              num={pad(sections.findIndex((x) => x.id === section.id) + 1)}
              title={section.title}
              sub={section.blurb}
              tail={section.turn}
              delay={0.5}
            />

            <button type="button" className="section-video-skip" onClick={finish} aria-label="Skip video (Esc)">
              <span className="section-video-skip-text">
                Skip <small>Esc</small>
              </span>
              <span className="section-video-skip-arrow">
                <ArrowIcon />
              </span>
            </button>

            <div className="section-video-progress">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  )
}
