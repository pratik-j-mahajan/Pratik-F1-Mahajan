import { useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'

// How long each state stays on air before the broadcast cuts to the other
const NORMAL_MS = 7000
const LIVE_MS = 16000
const SEGMENT_MS = 3200
const WIPE = { duration: 0.7, ease: [0.7, 0, 0.2, 1] }
const SNAP = { type: 'spring', stiffness: 520, damping: 34 }

// Broadcast graphics that rotate while live — tone drives the tag colour
const SEGMENTS = [
  { tag: 'Breaking', tone: 'red', text: 'Mahajan clears Q3 with a pixel-perfect lap' },
  { tag: 'Team radio', tone: 'blue', text: '“Box box, ship the design system.” — “Copy.”', radio: true },
  { tag: 'Fastest lap', tone: 'purple', text: 'Wireframe → prototype', time: '1:12.408' },
  { tag: 'Overtake', tone: 'green', text: 'MAH passes VER into Turn 1 — around the outside!', overtake: true },
  { tag: 'Stewards', tone: 'amber', text: 'No kerning violations found. No further action.' },
  { tag: 'Weather', tone: 'sky', text: '0% chance of Comic Sans this session' },
]

// White utility strip above the home bar — for show only, nothing here is clickable.
// Every few seconds it cuts to a live-broadcast graphic, then cuts back.
export default function TopBar() {
  const [live, setLive] = useState(false)
  const [cuts, setCuts] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer
    const schedule = (isLive) => {
      timer = setTimeout(
        () => {
          setLive(!isLive)
          setCuts((c) => c + 1)
          schedule(!isLive)
        },
        isLive ? LIVE_MS : NORMAL_MS,
      )
    }
    schedule(false)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="topbar" aria-hidden="true">
      <motion.div
        className="topbar-normal"
        animate={{ opacity: live ? 0 : 1, y: live ? '-40%' : '0%' }}
        transition={{ duration: 0.25, delay: live ? 0.2 : 0.35 }}
      >
        <div className="topbar-left">
          <img src="/images/fia-logo.svg" alt="" className="topbar-fia" />
          <span className="topbar-divider" />
          <span className="topbar-series">
            <span className="is-on">
              F1<small>™</small>
            </span>
            <span>
              F2<small>™</small>
            </span>
            <span>
              F3<small>™</small>
            </span>
          </span>
        </div>
        <div className="topbar-right">
          <span className="topbar-links">
            <span>Authentics</span>
            <span>Store</span>
            <span>Tickets</span>
            <span>Hospitality</span>
            <span>Experiences</span>
          </span>
          <span className="topbar-divider topbar-divider--tall" />
          <img src="/images/f1tv-logo.svg" alt="" className="topbar-f1tv" />
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {live && (
          <motion.div
            key="live"
            className="topbar-live"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            exit={{ clipPath: 'inset(0 0 0 100%)' }}
            transition={WIPE}
          >
            <LiveBroadcast />
          </motion.div>
        )}
      </AnimatePresence>

      {/* red + black slanted bars riding the wipe edge on every cut */}
      {cuts > 0 && (
        <motion.span
          key={cuts}
          className="topbar-wipe"
          initial={{ left: '-12%' }}
          animate={{ left: '106%' }}
          transition={WIPE}
        >
          <i />
          <i />
        </motion.span>
      )}
    </div>
  )
}

function LiveBroadcast() {
  const [seg, setSeg] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const [speed, setSpeed] = useState(312)
  const [order, setOrder] = useState(['VER', 'MAH', 'NOR'])
  const [lap, setLap] = useState(() => 41 + Math.floor(Math.random() * 8))

  useEffect(() => {
    const segments = setInterval(() => setSeg((s) => (s + 1) % SEGMENTS.length), SEGMENT_MS)
    const clock = setInterval(() => setNow(new Date()), 1000)
    const trap = setInterval(() => setSpeed(288 + Math.round(Math.random() * 46)), 450)
    const laps = setInterval(() => setLap((l) => Math.min(58, l + 1)), 5500)
    return () => [segments, clock, trap, laps].forEach(clearInterval)
  }, [])

  // the overtake happens on screen when its graphic comes up
  const current = SEGMENTS[seg]
  useEffect(() => {
    if (current.overtake) setOrder(['MAH', 'VER', 'NOR'])
  }, [current])

  const time = now.toLocaleTimeString('en-GB', { hour12: false })

  return (
    <>
      <div className="live-left">
        <motion.span
          className="live-badge"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ...SNAP, delay: 0.35 }}
        >
          <i className="live-dot" />
          Live
        </motion.span>
        <img src="/images/f1tv-logo.svg" alt="" className="live-f1tv" />
        <span className="live-lap">
          Lap{' '}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.b
              key={lap}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={SNAP}
            >
              {lap}
            </motion.b>
          </AnimatePresence>
          /58
        </span>
      </div>

      <div className="live-story">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={seg}
            className="live-segment"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '-110%' }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.span
              className={`live-tag is-${current.tone}`}
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {current.tag}
            </motion.span>
            {current.radio && (
              <span className="live-wave">
                {Array.from({ length: 9 }, (_, i) => (
                  <i key={i} style={{ animationDelay: `${(i * 97) % 500}ms` }} />
                ))}
              </span>
            )}
            <span className="live-text">
              {current.text.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.04, duration: 0.25 }}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </span>
            {current.time && (
              <motion.span
                className="live-time"
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...SNAP, delay: 0.5 }}
              >
                {current.time}
              </motion.span>
            )}
          </motion.div>
        </AnimatePresence>
        <motion.span
          key={`bar-${seg}`}
          className="live-progress"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: SEGMENT_MS / 1000, ease: 'linear' }}
        />
      </div>

      <div className="live-right">
        <LayoutGroup>
          <span className="live-tower">
            {order.map((code, i) => (
              <motion.span
                key={code}
                layout
                transition={SNAP}
                className={`live-driver${code === 'MAH' ? ' is-me' : ''}`}
              >
                <b>{i + 1}</b>
                {code}
                {code === 'MAH' && current.overtake && <em>▲</em>}
              </motion.span>
            ))}
          </span>
        </LayoutGroup>
        <span className="live-speed">
          <span className="live-gauge">
            <motion.i animate={{ scaleX: (speed - 250) / 100 }} transition={SNAP} />
          </span>
          <b>{speed}</b>
          <small>km/h</small>
        </span>
        <span className="live-clock">{time}</span>
      </div>
    </>
  )
}
