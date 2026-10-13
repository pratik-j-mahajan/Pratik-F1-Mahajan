import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { disciplines, links, profile } from '../../../data/about.js'
import { tools } from '../../../data/skills.js'
import { Photo } from './Hero.jsx'
import { Ticket } from './Sections.jsx'
import { Rise } from '../../reveal.jsx'

/*
  About — the profile after the pass is scanned. Minimal and warm:
  an intro with a rotating last word, your photo (it still flies in from the scanned pass),
  four quick facts, an interactive "what I do" (pick a discipline → its tools light up),
  and one friendly call to action.
*/
const ease = [0.22, 1, 0.36, 1]
const WORDS = ['enjoy', 'trust', 'come back to', 'love using']
const ABOUT_DISCIPLINE = {
  'Product Design': 'Shaping the whole product — from the problem worth solving to the flow that solves it.',
  'Visual Design': 'Type, colour and layout that make an interface feel calm, clear and a little delightful.',
  'User Experience': 'Research, flows and small details that remove friction people didn’t know they had.',
  'User Interface': 'Pixel-tidy screens, components and motion that are a joy to build and to use.',
}

function useClock(timeZone) {
  const fmt = useMemo(() => new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }), [timeZone])
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const t = setInterval(() => setNow(fmt.format(new Date())), 10000)
    return () => clearInterval(t)
  }, [fmt])
  return now
}

export default function Profile({ from, delay = 0 }) {
  return (
    <>
      <Intro from={from} delay={delay} />
      <Facts />
      <Skills />
      <Ticket />
    </>
  )
}

/* ------------------------------------------------------------------ intro */

function RotatingWord() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2400)
    return () => clearInterval(t)
  }, [reduce])
  return (
    <span className="prx-rot">
      {/* every word sits invisibly in the same spot, so the slot is always as wide as the
          longest one — the headline never reflows or jumps while the word changes */}
      {WORDS.map((w) => (
        <span key={w} className="prx-rot-ghost" aria-hidden="true">
          {w}.
        </span>
      ))}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={WORDS[i]}
          initial={{ y: '60%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-60%', opacity: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          {WORDS[i]}
          <i>.</i>
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Intro({ from, delay }) {
  const d = delay
  const time = useClock(profile.timeZone)
  return (
    <section className="prx-intro" aria-label="About">
      <div className="prx-intro-copy">
        <Rise as="p" className="prx-hello" play delay={d}>
          <span aria-hidden="true">👋</span> Hey, I’m {profile.first}
        </Rise>
        <Rise as="h1" className="prx-title" play delay={d + 0.06}>
          I turn messy ideas into interfaces people <RotatingWord />
        </Rise>
        <Rise as="p" className="prx-lead" play delay={d + 0.14}>
          {profile.intro}
        </Rise>
        <Rise className="prx-actions" play delay={d + 0.22}>
          <a className="prx-btn prx-btn--solid" href="/resume.pdf" download="Pratik-Mahajan-Resume.pdf">
            Download résumé
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 2v9M4 7.5 8 11.5 12 7.5M3 14h10" />
            </svg>
          </a>
          <Link className="prx-btn" to="/contact">
            Say hello <span aria-hidden="true">→</span>
          </Link>
        </Rise>
        <Rise className="prx-chips" play delay={d + 0.3}>
          <span className="prx-chip">
            <i className="prx-dot prx-dot--green" aria-hidden="true" /> Open to product design roles
          </span>
          <span className="prx-chip">
            <i className="prx-dot" aria-hidden="true" /> {profile.base} · {time} IST
          </span>
        </Rise>
      </div>
      <div className="prx-photo">
        <Photo from={from} delay={d} />
        <span className="prx-photo-chip">
          <i aria-hidden="true" /> Based in Pune · IST
        </span>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ quick facts */

function Facts() {
  const items = [
    { k: 'Education', v: 'B.Tech, Computer Science', s: `${profile.education.school.replace(', Pune', '')} · ’${profile.education.batch.slice(2)}` },
    { k: 'Based in', v: profile.base, s: 'Happy to work remote or on-site' },
    { k: 'On LinkedIn', v: '1M+ impressions', s: 'UX breakdowns of everyday apps' },
    { k: 'Currently', v: 'Designing', s: profile.now },
  ]
  return (
    <section className="prx-sec" aria-labelledby="prx-facts-title">
      <h2 id="prx-facts-title" className="prx-kicker">
        At a glance
      </h2>
      <ul className="prx-facts">
        {items.map((f, i) => (
          <Rise as="li" key={f.k} delay={i * 0.06}>
            <span className="prx-fact-k">{f.k}</span>
            <span className="prx-fact-v">{f.v}</span>
            <span className="prx-fact-s">{f.s}</span>
          </Rise>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------ skills, spelled out (above the ticket) */

function Skills() {
  return (
    <section className="prx-sec prx-skills" aria-labelledby="prx-skills-title">
      <h2 id="prx-skills-title" className="prx-kicker">
        Skills &amp; tools
      </h2>
      <div className="prx-skill-rows">
        <div className="prx-skill-row">
          <p className="prx-skill-label">What I do</p>
          <ul>
            {disciplines.map((d) => (
              <Rise as="li" key={d.name} className="prx-skill">
                {d.name}
              </Rise>
            ))}
          </ul>
        </div>
        {[
          ['Tools I use', tools.filter((t) => !t.ai)],
          ['AI tools', tools.filter((t) => t.ai)],
        ].map(([label, list]) => (
          <div className="prx-skill-row" key={label}>
            <p className="prx-skill-label">{label}</p>
            <ul>
              {list.map((t) => (
                <Rise as="li" key={t.name} className="prx-skill prx-skill--tool">
                  <span className="prx-tool-mark">
                    <ToolMark tool={t} />
                  </span>
                  {t.name}
                </Rise>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ what I do (interactive) */

function ToolMark({ tool }) {
  if (tool.logo) return <img src={tool.logo} alt="" />
  if (tool.badge)
    return (
      <span className="prx-badge" style={{ background: tool.badge.bg, color: tool.badge.fg }}>
        {tool.badge.text}
      </span>
    )
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ fill: `#${tool.icon.hex}` }}>
      <path d={tool.icon.path} />
    </svg>
  )
}

function WhatIDo() {
  const [active, setActive] = useState(0)
  const lit = new Set(disciplines[active].tools)
  return (
    <section className="prx-sec" aria-labelledby="prx-do-title">
      <h2 id="prx-do-title" className="prx-kicker">
        What I do
      </h2>
      <div className="prx-do">
        <ul className="prx-disc" role="tablist" aria-label="Disciplines">
          {disciplines.map((d, i) => (
            <li key={d.name}>
              <button
                type="button"
                role="tab"
                aria-selected={active === i}
                className={active === i ? 'is-on' : ''}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className="prx-disc-n">0{i + 1}</span>
                <span className="prx-disc-name">{d.name}</span>
                <span className="prx-disc-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="prx-panel">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              className="prx-panel-text"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              {ABOUT_DISCIPLINE[disciplines[active].name]}
            </motion.p>
          </AnimatePresence>
          <p className="prx-panel-label">Tools I reach for</p>
          <ul className="prx-tools">
            {tools.map((t) => (
              <li key={t.name} className={lit.has(t.name) ? 'is-lit' : ''}>
                <span className="prx-tool-mark">
                  <ToolMark tool={t} />
                </span>
                {t.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ finish */

function Finish() {
  const reduce = useReducedMotion()
  const social = [
    ['LinkedIn', links.linkedin],
    ['Behance', links.behance],
    ['Instagram', links.instagram],
  ].filter(([, u]) => u)
  return (
    <section className="prx-sec prx-finish" aria-labelledby="prx-finish-title">
      <Rise className="prx-cta">
        <p className="prx-kicker">Let’s talk</p>
        <h2 id="prx-finish-title" className="prx-cta-title">
          Let’s build something worth a second click<i>.</i>
        </h2>
        <div className="prx-actions">
          <Link className="prx-btn prx-btn--solid" to="/contact">
            Get in touch <span aria-hidden="true">→</span>
          </Link>
          <Link className="prx-btn" to="/case-study">
            See the work
          </Link>
        </div>
      </Rise>
      <footer className="prx-foot">
        <p>
          © {new Date().getFullYear()} {profile.first} {profile.last} · Designed &amp; built in Pune
        </p>
        <nav aria-label="More">
          {social.map(([n, u]) => (
            <a key={n} href={u} target="_blank" rel="noreferrer">
              {n} ↗
            </a>
          ))}
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}>
            Back to top ↑
          </button>
          <Link to="/map">Return to circuit →</Link>
        </nav>
      </footer>
    </section>
  )
}
