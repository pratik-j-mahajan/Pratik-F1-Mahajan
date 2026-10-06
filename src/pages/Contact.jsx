import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import BackButton from '../components/BackButton.jsx'
import { contact, links, profile } from '../data/about.js'
import '../styles/cases.css'
import '../styles/contact.css'

/*
  Contact — team radio. Simple on purpose: the ways to reach me, each with a line of
  (friendly) sarcasm, and a copy button for the email and number.
*/
const ease = [0.22, 1, 0.36, 1]

function useClock(timeZone) {
  const fmt = useMemo(() => new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }), [timeZone])
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const t = setInterval(() => setNow(fmt.format(new Date())), 10000)
    return () => clearInterval(t)
  }, [fmt])
  return now
}

export default function Contact() {
  const time = useClock(profile.timeZone)
  const [copied, setCopied] = useState('')

  const copy = (value, label) => {
    navigator.clipboard?.writeText(value).then(
      () => {
        setCopied(label)
        setTimeout(() => setCopied(''), 1800)
      },
      () => {},
    )
  }

  const rows = [
    {
      k: 'email',
      label: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`,
      quip: 'The proper channel. I actually read these — all the way to the end.',
      copy: true,
    },
    links.linkedin && {
      k: 'linkedin',
      label: 'LinkedIn',
      value: 'in/pratik-j-mahajan',
      href: links.linkedin,
      quip: 'A million impressions found me there. You’re welcome to be one more.',
      external: true,
    },
    links.instagram && {
      k: 'instagram',
      label: 'Instagram',
      value: '@pratikjmahajan',
      href: links.instagram,
      quip: 'The less serious side. Still pixel-perfect, obviously.',
      external: true,
    },
    {
      k: 'resume',
      label: 'Résumé',
      value: 'The one-page version',
      to: '/resume',
      quip: 'Everything above, but formatted like I mean business.',
    },
  ].filter(Boolean)

  return (
    <div className="cw ctc">
      <header className="cw-nav">
        <div className="cw-nav-left">
          <BackButton />
          <span className="cw-brand">
            <img src="/images/f1-logo-red.svg" alt="" />
            <span>Contact</span>
          </span>
        </div>
      </header>

      <main className="ctc-main">
        <motion.p className="ctc-radio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <i className="ctc-wave" aria-hidden="true">
            <b />
            <b />
            <b />
            <b />
          </i>
          Team radio · open channel
        </motion.p>

        <motion.h1 className="ctc-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease }}>
          Box, box. <em>Let’s talk.</em>
        </motion.h1>

        <motion.p className="ctc-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12, ease }}>
          I reply faster than Figma opens a big file. Low bar? Sure. But I clear it every single time.
        </motion.p>

        <ul className="ctc-list">
          {rows.map((r, i) => {
            const inner = (
              <>
                <span className="ctc-label">{r.label}</span>
                <span className="ctc-value">{r.value}</span>
                <span className="ctc-quip">{r.quip}</span>
                <span className="ctc-arrow" aria-hidden="true">
                  {r.external ? '↗' : '→'}
                </span>
              </>
            )
            return (
              <motion.li
                key={r.k}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.07, ease }}
              >
                {r.to ? (
                  <Link className="ctc-row" to={r.to}>
                    {inner}
                  </Link>
                ) : (
                  <a className="ctc-row" href={r.href} {...(r.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {inner}
                  </a>
                )}
                {r.copy && (
                  <button type="button" className="ctc-copy" onClick={() => copy(r.value, r.label)} aria-label={`Copy ${r.label.toLowerCase()}`}>
                    {copied === r.label ? 'Copied' : 'Copy'}
                  </button>
                )}
              </motion.li>
            )
          })}
        </ul>

        <motion.dl className="ctc-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }}>
          <div>
            <dt>Based in</dt>
            <dd>{profile.base}</dd>
          </div>
          <div>
            <dt>Local time</dt>
            <dd>
              <i className="ctc-live" aria-hidden="true" />
              {time} IST
            </dd>
          </div>
          <div>
            <dt>Reply time</dt>
            <dd>Usually within a day</dd>
          </div>
        </motion.dl>

        <p className="ctc-foot">P.S. Opening with a good design pun gets you to the front of the queue. Bad ones too, honestly.</p>
      </main>

      <AnimatePresence>
        {copied && (
          <motion.p
            className="ctc-toast"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            {copied} copied. Copy-paste: still undefeated.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
