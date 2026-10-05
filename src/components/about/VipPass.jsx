import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Barcode, QrCode } from './Codes.jsx'

// Loose, bouncy spring so the pass swings like it's hanging from a lanyard
const SWING = { stiffness: 50, damping: 5, mass: 1.2 }
const TILT = { stiffness: 140, damping: 15 }
const LANYARD_TEXT = 'VIP PASS ✦ PADDOCK CLUB ✦ '.repeat(6)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

/*
  Realistic hanging accreditation: broad printed lanyard, metal clip, clear plastic
  sleeve, and a two-sided card. Drag/throw it, hover to tilt, tap to flip.
  `dropKey` changes each time the start lights go out, which re-drops the pass.
*/
export default function VipPass({ dropKey }) {
  const reduce = useReducedMotion()
  const hovering = useRef(false)
  const [flipped, setFlipped] = useState(false)

  const swing = useSpring(0, SWING)
  const sway = useMotionValue(0)
  const rotate = useTransform([swing, sway], ([a, b]) => a + b)
  const rotateY = useSpring(0, TILT)
  const rotateX = useSpring(0, TILT)
  const glareX = useMotionValue(30)
  const glareY = useMotionValue(20)
  const sheen = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.65), rgba(255,255,255,0) 40%), linear-gradient(${110 + x / 3}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 60%)`
  )

  // Each drop: yank it to one side, then let it swing to rest
  useEffect(() => {
    if (reduce || dropKey === 0) return
    swing.jump(-22)
    const t = setTimeout(() => swing.set(0), 60)
    return () => clearTimeout(t)
  }, [dropKey, reduce, swing])

  useAnimationFrame((t) => {
    if (reduce) return
    const target = hovering.current ? 0 : Math.sin(t / 1300) * 1.6
    sway.set(sway.get() + (target - sway.get()) * 0.04)
  })

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    hovering.current = true
    rotateY.set(px * 24)
    rotateX.set(-py * 12)
    glareX.set((px + 0.5) * 100)
    glareY.set((py + 0.5) * 100)
  }
  const onLeave = () => {
    hovering.current = false
    rotateY.set(0)
    rotateX.set(0)
  }

  return (
    <motion.div
      key={dropKey}
      className="pass-rig"
      style={{ rotate, transformOrigin: '50% 0%' }}
      initial={dropKey ? { y: '-115%' } : false}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 11, mass: 1 }}
    >
      {/* broad lanyard, both straps meeting at the clip */}
      <div className="lanyard" aria-hidden="true">
        <span className="lanyard-strap lanyard-strap--l">
          <i>{LANYARD_TEXT}</i>
        </span>
        <span className="lanyard-strap lanyard-strap--r">
          <i>{LANYARD_TEXT}</i>
        </span>
        <span className="lanyard-crimp" />
        <span className="lanyard-ring" />
        <span className="lanyard-hook" />
      </div>

      <motion.div
        className="pass-holder"
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onPan={(_, info) => swing.set(clamp(info.offset.x * 0.14, -34, 34))}
        onPanEnd={(_, info) => swing.set(clamp(-info.velocity.x * 0.004, -10, 10))}
        onTap={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label={`VIP pass for Pratik Mahajan — ${flipped ? 'back' : 'front'} side. Press to flip.`}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setFlipped((f) => !f))}
      >
        <span className="pass-thumb" aria-hidden="true" />
        <motion.div
          className="pass-flip"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        >
          <PassFront />
          <PassBack />
        </motion.div>
        <motion.span className="pass-sheen" style={{ backgroundImage: sheen }} aria-hidden="true" />
      </motion.div>

      <p className="pass-hint" aria-hidden="true">
        Drag it · Tap to flip
      </p>
    </motion.div>
  )
}

export function PassFront() {
  return (
    <div className="pass-face pass-front">
      <header className="pf-top">
        <div>
          <p className="pf-vip">VIP PASS</p>
          <p className="pf-club">Paddock Club · 2026</p>
        </div>
        <img src="/images/f1-logo-white.svg" alt="" className="pf-logo" />
      </header>

      <div className="pf-mid">
        <div className="pf-photo">
          <img src="/images/about/pratik-id.webp" alt="Pratik Mahajan" />
        </div>
        <div className="pf-side">
          <p className="pf-num">06</p>
          <p className="pf-flag" aria-label="India">
            <span />
            <span>
              <i />
            </span>
            <span />
          </p>
          <p className="pf-zones-label">Zones</p>
          <div className="pf-zones">
            {[1, 2, 3, 4, 5, 6].map((z) => (
              <span key={z}>{z}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="pf-name">
        <p className="pf-first">Pratik</p>
        <p className="pf-last">Mahajan</p>
        <p className="pf-role">Product Designer · Pratik Racing</p>
      </div>

      <footer className="pf-foot">
        <div className="pf-access">
          <span>All Access</span>
          <small>ID PM-06-2026</small>
        </div>
        <Barcode className="pf-barcode" seed={61} bars={44} />
      </footer>
      <span className="pf-holo" aria-hidden="true">
        06
      </span>
      <span className="pf-stripes" aria-hidden="true" />
    </div>
  )
}

function PassBack() {
  return (
    <div className="pass-face pass-back">
      <p className="pb-title">Terms &amp; Conditions</p>
      <p className="pb-sub">(yes, someone actually reads these)</p>
      <ol className="pb-terms">
        <li>Holder may redesign your app without being asked.</li>
        <li>“Just a small change” is never small. Holder knows this.</li>
        <li>Fueled by coffee. Do not approach before the first cup.</li>
        <li>Pass void if you say “make the logo bigger”.</li>
      </ol>
      <div className="pb-row">
        <div>
          <p className="pb-label">Emergency contact</p>
          <p className="pb-value">Ctrl + Z</p>
          <p className="pb-label">If found</p>
          <p className="pb-value">Return to nearest coffee machine</p>
        </div>
        <QrCode className="pb-qr" seed={606} size={21} />
      </div>
      <p className="pb-sign">Pratik M.</p>
      <p className="pb-fine">Not valid for actually entering an F1 paddock. Sadly.</p>
    </div>
  )
}
