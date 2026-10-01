import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

// The site's shared motion language: fast → controlled for wipes, a soft settle for type.
export const ease = [0.7, 0, 0.2, 1]
export const settle = [0.22, 1, 0.36, 1]

const VIEW = { once: true, margin: '0px 0px -12% 0px' }

// Lines of type that rise out of a mask. Plays when scrolled into view, or when `play` is set.
export function Lines({ as = 'div', lines, className, delay = 0, stagger = 0.08, play, ...rest }) {
  const ref = useRef(null)
  const seen = useInView(ref, VIEW)
  const reduce = useReducedMotion()
  const on = play ?? seen
  const Tag = as
  return (
    <Tag ref={ref} className={className} {...rest}>
      {lines.map((line, k) => (
        <span key={k}>
          {k > 0 && ' '}
          <span className="rv-mask">
            <motion.span
              className="rv-mask-in"
              initial={reduce ? false : { y: '112%' }}
              animate={on || reduce ? { y: '0%' } : undefined}
              transition={{ duration: 0.95, delay: delay + k * stagger, ease: settle }}
            >
              {line}
            </motion.span>
          </span>
        </span>
      ))}
    </Tag>
  )
}

// A block that lifts in once. `play` overrides the in-view trigger (used above the fold).
export function Rise({ as = 'div', className, delay = 0, y = 22, play, children, ...rest }) {
  const ref = useRef(null)
  const seen = useInView(ref, VIEW)
  const reduce = useReducedMotion()
  const on = play ?? seen
  const Tag = motion[as]
  return (
    <Tag
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={on || reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay, ease: settle }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

// Hook for "has this scrolled into view yet" on an unclipped wrapper.
export function useSeen(amount) {
  const ref = useRef(null)
  const seen = useInView(ref, amount ? { once: true, amount } : VIEW)
  return [ref, seen]
}
