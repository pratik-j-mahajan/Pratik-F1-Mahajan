import { useEffect, useState } from 'react'
import BackButton from '../components/BackButton.jsx'
import { CardStack } from './cases/CaseList.jsx'
import projects from '../data/projects.js'
import '../styles/cases.css'

/* Projects — the same card stack as Case Studies, in F1 red (theme lives under .pj in cases.css). */
export default function Projects() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <div className="cw pj">
      <header className={`cw-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="cw-nav-left">
          <BackButton />
          <span className="cw-brand">
            <img src="/images/f1-logo-white.svg" alt="" />
            <span>Projects</span>
          </span>
        </div>
      </header>
      <main className="cw-main">
        <CardStack items={projects} label="Projects" />
      </main>
    </div>
  )
}
