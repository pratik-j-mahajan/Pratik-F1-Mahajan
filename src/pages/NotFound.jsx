import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton.jsx'
import '../styles/cases.css'
import '../styles/notfound.css'

/*
  404 — the page didn't finish the race. Shown for any address that doesn't exist,
  including the "coming soon" case study card for now.
*/
const ease = [0.22, 1, 0.36, 1]

export default function NotFound() {
  const { pathname } = useLocation()
  const soon = pathname === '/coming-soon'

  return (
    <div className="cw nf">
      <header className="cw-nav">
        <div className="cw-nav-left">
          <BackButton />
          <Link to="/" className="cw-brand" aria-label="Home">
            <img src="/images/f1-logo-red.svg" alt="" />
            <span>Race control</span>
          </Link>
        </div>
      </header>

      <main className="nf-main">
        <motion.div className="nf-board" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <p className="nf-flag">
            <i aria-hidden="true" /> Red flag · Session suspended
          </p>
          <p className="nf-code" aria-hidden="true">
            4<span>0</span>4
          </p>
          <div className="nf-row">
            <span className="nf-pos">DNF</span>
            <span className="nf-name">{soon ? 'Case study 03' : pathname.replace(/^\//, '') || 'This page'}</span>
            <span className="nf-status">{soon ? 'In the garage' : 'Retired'}</span>
          </div>
        </motion.div>

        <motion.h1 className="nf-title" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease }}>
          {soon ? 'Still in the garage.' : 'This page didn’t finish the race.'}
        </motion.h1>
        <motion.p className="nf-sub" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18, ease }}>
          {soon
            ? 'The mechanics are still bolting this case study together. It’ll roll out soon — promise it’s worth the wait.'
            : 'Either it took a wrong turn at Turn 4, or it never made it out of the pit lane. Happens to the best of us.'}
        </motion.p>

        <motion.div className="nf-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Link className="nf-btn" to={soon ? '/case-study' : '/map'}>
            {soon ? 'Back to case studies' : 'Back to the circuit'} <span aria-hidden="true">→</span>
          </Link>
          <Link className="nf-link" to="/">
            Home
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
