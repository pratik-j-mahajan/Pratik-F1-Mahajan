import { motion } from 'framer-motion'

/*
  F1-style intro (~4s, timed by INTRO_DURATION in App):
  0.0s  red tiles slide in, alternating from the top and bottom, and lock together
  1.0s  tiles blend into one red screen
  1.2s  the white F1 logo slices in at the centre, with a speed line
  3.2s  fades to black
  exit  black fades away, revealing the home page
*/
const snap = [0.76, 0, 0.24, 1]
const TILES = 8

export default function Intro() {
  return (
    <motion.div
      className="intro"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {Array.from({ length: TILES }, (_, i) => (
        <motion.span
          key={i}
          className="intro-tile"
          style={{
            left: `${(100 / TILES) * i}%`,
            width: `calc(${100 / TILES}% + 1px)`,
            background: i % 2 ? '#c90500' : '#e10600',
          }}
          initial={{ y: i % 2 ? '100%' : '-100%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.75, delay: 0.06 * i, ease: snap }}
        />
      ))}

      <motion.div
        className="intro-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <motion.img
          className="intro-logo"
          src="/images/f1-logo-white.svg"
          alt="F1"
          initial={{ clipPath: 'inset(0 100% 0 0)', x: -40, scale: 1.08 }}
          animate={{ clipPath: 'inset(0 0% 0 0)', x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.2, ease: snap }}
        />
        <motion.span
          className="intro-speedline"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
          transition={{ duration: 1.2, delay: 1.5, times: [0, 0.5, 1], ease: 'easeOut' }}
        />
      </motion.div>

      <motion.div
        className="intro-fade"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 3.2, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
