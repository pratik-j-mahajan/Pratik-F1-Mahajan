import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ease } from '../../components/reveal.jsx'

/*
  Opening a project flies its visual from wherever it was clicked into the case page's
  cover. The click records the visual's rect in the navigation state; the case page
  measures its cover and animates a copy of the image between the two.
*/
export const rectOf = (el) => {
  const r = el?.getBoundingClientRect()
  return r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null
}

export function useOpenCase() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  return (study, getEl) => (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    const from = reduce ? null : rectOf(getEl())
    navigate(`/case-study/${study.slug}`, { state: from ? { from } : null })
  }
}

export function CoverFlight({ from, to, src, onDone }) {
  return createPortal(
    <motion.div
      className="cw-flight"
      initial={{ ...from, borderRadius: 2 }}
      animate={{ ...to, borderRadius: 2 }}
      transition={{ duration: 0.9, ease }}
      onAnimationComplete={onDone}
      aria-hidden="true"
    >
      <img src={src} alt="" />
    </motion.div>,
    document.body,
  )
}
