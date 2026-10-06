import { motion, useReducedMotion } from 'framer-motion'

/*
  Intro (2.2s, timed by INTRO_DURATION in App) — F1 red, the logo and one line of type.
  0.00s  twelve red strips slide in, alternating from the top and bottom, a hair apart
  0.62s  the white F1 logo is revealed left to right, a white hairline draws beneath it,
         and the caption settles in
  1.55s  the site mounts underneath; the logo and caption lift away
  1.60s  the strips peel away, centre first, carrying on in the direction they came — onto black
  2.20s  the black fades out slowly (0.8s, ending at 3s), revealing the site
*/
const snap = [0.77, 0, 0.18, 1]
const soft = [0.65, 0, 0.35, 1]
const out = [0.16, 1, 0.3, 1]
const OPEN = 1.6 // when the strips start to peel away
const STRIPS = 12

export default function Intro() {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <motion.div className="intro intro--still" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
        <Mark still />
      </motion.div>
    )
  }

  return (
    <motion.div className="intro" exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.45, 0, 0.55, 1] }}>
      {/* black behind the strips: you see it before they close and after they peel away,
          then the whole intro fades out of it smoothly onto the site */}
      <span className="intro-black" />

      {/* the red screen is made of thin strips: odd ones drop from the top, even ones rise from
          the bottom, a hair apart — they lock together, then peel away the same way, centre first */}
      {Array.from({ length: STRIPS }, (_, i) => {
        const fromTop = i % 2 === 0
        const off = fromTop ? '-101%' : '101%'
        const inDelay = i * 0.028
        const outDelay = Math.abs(i - (STRIPS - 1) / 2) * 0.03
        const total = OPEN + 0.62
        return (
          <motion.span
            key={i}
            className="intro-strip"
            style={{ left: `${(100 / STRIPS) * i}%`, width: `calc(${100 / STRIPS}% + 1px)` }}
            initial={{ y: off }}
            animate={{ y: [off, '0%', '0%', fromTop ? '101%' : '-101%'] }}
            transition={{
              duration: total,
              times: [inDelay / total, (inDelay + 0.38) / total, (OPEN + outDelay) / total, (OPEN + outDelay + 0.42) / total],
              ease: snap,
            }}
          />
        )
      })}

      <Mark />
    </motion.div>
  )
}

function Mark({ still }) {
  return (
    <motion.div
      className="intro-mark"
      initial={still ? false : { opacity: 1 }}
      animate={still ? undefined : { opacity: [1, 1, 0], y: [0, 0, -24] }}
      transition={still ? undefined : { duration: OPEN + 0.1, times: [0, 0.88, 1], ease: soft }}
    >
      <motion.img
        className="intro-logo"
        src="/images/f1-logo-white.svg"
        alt="F1"
        initial={still ? false : { clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 0.6, delay: 0.62, ease: soft }}
      />
      <motion.span
        className="intro-rule"
        initial={still ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.95, ease: out }}
      />
      <motion.p
        className="intro-caption"
        initial={still ? false : { opacity: 0, letterSpacing: '0.6em' }}
        animate={{ opacity: 1, letterSpacing: '0.38em' }}
        transition={{ duration: 0.7, delay: 1.0, ease: out }}
      >
        Pratik Mahajan <i>·</i> Portfolio 2026
      </motion.p>
    </motion.div>
  )
}
