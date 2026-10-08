import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useSpring } from 'framer-motion'
import { disciplines, links, profile } from '../../../data/about.js'
import { tools } from '../../../data/skills.js'
import { Barcode } from '../Codes.jsx'
import { Rise, settle } from '../../reveal.jsx'

/*
  The ticket. What I do, the kit, and "let's build" — printed as one F1 race ticket:
  the main part is your admission (access zones = disciplines, pit equipment = tools),
  the tear-off stub is the call to action. Pointing at a zone lights up the tools behind it.
*/
const TILT = { stiffness: 140, damping: 18 }
const SOCIAL = [
  ['LinkedIn', links.linkedin],
  ['Behance', links.behance],
  ['Instagram', links.instagram],
].filter(([, url]) => url)

// the Figma ticket is 1077 × 361; on wide screens it's drawn at that size and scaled to fit
const TK_W = 1077
const TK_H = 361

function useFit(ref) {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1.25, e.contentRect.width / TK_W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return scale
}

export function Ticket() {
  const reduce = useReducedMotion() || new URLSearchParams(window.location.search).has('capture')
  const [active, setActive] = useState(null)
  const lit = active === null ? null : new Set(disciplines[active].tools)
  const rotateX = useSpring(0, TILT)
  const rotateY = useSpring(0, TILT)
  const fit = useRef(null)
  const scale = useFit(fit)
  const toTop = () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })

  // the ticket leans a little toward the pointer, like it's held in a hand
  const onMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 4)
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 4)
  }
  const onLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    setActive(null)
  }

  return (
    <section className="tk-sec" aria-labelledby="tk-title">
      <div className="tk-head">
        <Rise as="p" className="abx-kicker">
          Your ticket
        </Rise>
        <Rise as="h2" id="tk-title" className="tk-title" delay={0.05}>
          What I do, the tools I race with, and how to reach me — on one ticket.
        </Rise>
      </div>

      <div className="tk-fit" ref={fit} style={{ '--s': scale, '--fit-h': `${TK_H * scale}px` }}>
        <motion.article
          className="tk2"
          style={{ rotateX, rotateY, transformPerspective: 1800 }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          initial={reduce ? false : { opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: settle }}
        >
          <div className="tk2-stage">
            {/* ticket body with its notches (Figma: Subtract) */}
            <div className="tk2-shape" aria-hidden="true">
              <div className="tk2-shape-rot">
                <img src="/images/ticket/subtract.svg" alt="" />
              </div>
            </div>
            <div className="tk2-perf" aria-hidden="true">
              <div className="tk2-perf-rot">
                <img src="/images/ticket/separation.svg" alt="" />
              </div>
            </div>

            {/* ---------- admission ---------- */}
            <div className="tk2-main">
              <div className="tk2-band">
                <img className="tk2-band-bg" src="/images/ticket/band-top.svg" alt="" />
                <img className="tk2-logo" src="/images/ticket/f1-logo.svg" alt="" />
                <p className="tk2-event">
                  Portfolio Grand Prix <b>2026</b>
                </p>
              </div>

              <div className="tk2-holder">
                <p className="tk2-cap">Holder</p>
                <p className="tk2-name">
                  {profile.first} {profile.last}
                </p>
                <p className="tk2-role">{profile.role}</p>
                <dl className="tk2-seat">
                  {[
                    ['Gate', profile.number],
                    ['Stand', 'Pune'],
                    ['Row', 'IN'],
                    ['Seat', profile.number],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="tk2-tools">
                <p className="tk2-cap">Tools Access</p>
                <ul>
                  {tools.map((t) => (
                    <Tool key={t.name} tool={t} state={!lit ? '' : lit.has(t.name) ? ' is-lit' : ' is-dim'} />
                  ))}
                </ul>
              </div>

              {/* what I do, in one line — pointing at one lights up its tools */}
              <ul className="tk2-zones" onMouseLeave={() => setActive(null)} aria-label="What I do">
                {disciplines.map((d, i) => (
                  <li key={d.name}>
                    <button
                      type="button"
                      className={`${active === i ? 'is-on' : ''}${active !== null && active !== i ? ' is-dim' : ''}`}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      onClick={() => setActive(i)}
                      aria-pressed={active === i}
                    >
                      {d.name}
                    </button>
                  </li>
                ))}
              </ul>

              {/* security print: faint guilloche + watermark, a foil hologram, and the small print */}
              <span className="tk2-guilloche" aria-hidden="true" />
              <span className="tk2-watermark" aria-hidden="true">
                06
              </span>
              <span className="tk2-holo" aria-hidden="true">
                <img src="/images/ticket/f1-logo.svg" alt="" />
                <i>Official</i>
              </span>
              <p className="tk2-fine" aria-hidden="true">
                <span>Admit one · Paddock &amp; grandstand</span>
                <span>Non-transferable · Keep for the season</span>
              </p>
            </div>

            {/* ---------- stub ---------- */}
            <div className="tk2-stub">
              <p className="tk2-cap">Stub · keep this part</p>
              <p className="tk2-stub-title">
                Let’s build something worth a second click<i>.</i>
              </p>
              <div className="tk2-actions">
                <a className="ab-btn ab-btn--red" href="/resume.pdf" download>
                  Download résumé
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 2v9M4 7.5 8 11.5 12 7.5M3 14h10" />
                  </svg>
                </a>
                <Link className="ab-link" to="/contact">
                  Get in touch <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="tk2-code">
                <Barcode seed={6} bars={56} className="tk2-barcode" />
                <span>No. 2026 · 000006</span>
              </div>
            </div>
          </div>
        </motion.article>
      </div>

      <footer className="tk-foot">
        <p>
          © {new Date().getFullYear()} {profile.first} {profile.last} <span>·</span> Designed &amp; built in Pune
        </p>
        <nav aria-label="More">
          {SOCIAL.map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noreferrer" className="ab-link">
              {name} <span aria-hidden="true">↗</span>
            </a>
          ))}
          <button type="button" className="ab-link" onClick={toTop}>
            Back to top <span aria-hidden="true">↑</span>
          </button>
          <Link to="/map" className="ab-link">
            Return to circuit <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </footer>
    </section>
  )
}

function Tool({ tool, state }) {
  const style = tool.badge
    ? { '--brand': tool.badge.bg, '--brand-fg': tool.badge.fg }
    : { '--brand': tool.brand || `#${tool.icon.hex}` }
  return (
    <li className={`tk2-tool${state}`} style={style}>
      <span className="tk2-tool-icon">
        {tool.logo ? (
          <img src={tool.logo} alt="" />
        ) : tool.badge ? (
          <span className="tk2-tool-badge">{tool.badge.text}</span>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={tool.icon.path} />
          </svg>
        )}
      </span>
      {tool.name}
    </li>
  )
}
