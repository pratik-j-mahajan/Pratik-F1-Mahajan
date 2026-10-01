import { motion, useReducedMotion } from 'framer-motion'
import { ease } from './reveal.jsx'

/*
  F1 broadcast name strip — number, title (+ subtitle), and an optional tail block —
  wiped on block by block. Used for the About portrait and the case study visuals.
  Give it a `key` to replay the wipe when its content changes.
*/
export default function LowerThird({ num, title, sub, tail, play = true, delay = 0, className = '' }) {
  const reduce = useReducedMotion()
  const on = play || reduce
  const block = (i) => ({
    initial: reduce ? false : { clipPath: 'inset(0% 100% 0% 0%)' },
    animate: on ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined,
    transition: { duration: 0.55, delay: delay + i * 0.12, ease },
  })

  return (
    <p className={`lt ${className}`}>
      <motion.span className="lt-num" {...block(0)}>
        {num}
      </motion.span>
      <motion.span className="lt-name" {...block(1)}>
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </motion.span>
      {tail && (
        <motion.span className="lt-tail" {...block(2)}>
          {tail}
        </motion.span>
      )}
    </p>
  )
}
