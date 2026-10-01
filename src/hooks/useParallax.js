import { useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

const SPRING = { stiffness: 60, damping: 20, mass: 0.6 }

// Returns spring x/y values that drift opposite to the cursor, up to `shift` px at the edges.
export default function useParallax(shift) {
  const reduceMotion = useReducedMotion()
  const x = useSpring(useMotionValue(0), SPRING)
  const y = useSpring(useMotionValue(0), SPRING)

  const onMouseMove = (e) => {
    if (reduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    x.set(-nx * 2 * shift)
    y.set(-ny * 2 * shift)
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return { x, y, onMouseMove, onMouseLeave }
}
