import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton.jsx'
import { compact, floorCompact, featured, profile, reels, reelUrl, totals } from '../data/instagram.js'
import '../styles/cases.css'
import '../styles/instagram.css'

/*
  Instagram — Turn 3 on the circuit: @productwalaah, where I post about product design, UI/UX,
  tech and AI. Top: who it is and the account's numbers on the left, a screenshot of the real
  profile on the right. Then the project the account is built around, then every reel with its
  views, likes, comments and a share button. Content lives in src/data/instagram.js.
*/
const ease = [0.22, 1, 0.36, 1]
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.8, delay, ease },
})
const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const top = reels.reduce((a, r) => (r.views > a.views ? r : a), reels[0])

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" />
    </svg>
  )
}

const Heart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
  </svg>
)
const Bubble = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 11.6c0 4.4-3.8 7.9-8.5 7.9-1.3 0-2.6-.3-3.7-.8L3.5 20l1.3-3.9a7.6 7.6 0 0 1-1.3-4.5C3.5 7.2 7.3 3.7 12 3.7s8.5 3.5 8.5 7.9Z" />
  </svg>
)
const Send = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m21 3.5-8.2 17-2.4-7.2L3.5 11 21 3.5Zm-10.6 9.8L21 3.5" />
  </svg>
)
const Play = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4.5v15l13-7.5-13-7.5Z" />
  </svg>
)

// native share sheet where there is one, otherwise copy the link
function ShareButton({ reel }) {
  const [copied, setCopied] = useState(false)
  const share = async (e) => {
    e.preventDefault()
    const url = reelUrl(reel.id)
    try {
      if (navigator.share) await navigator.share({ title: reel.title, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      /* closed the sheet */
    }
  }
  return (
    <button type="button" className="ig-share" onClick={share} aria-label={`Share “${reel.title}”`}>
      <Send /> {copied ? 'Copied' : 'Share'}
    </button>
  )
}

export default function Instagram() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const stats = [
    [profile.followers, 'Followers'],
    [`${floorCompact(totals.views)}+`, 'Reel views'],
    [`${floorCompact(totals.likes)}+`, 'Likes'],
    [String(reels.length), 'Reels'],
  ]

  return (
    <div className="cw ig">
      <header className={`cw-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="cw-nav-left">
          <BackButton />
          <span className="cw-brand">
            <img src="/images/f1-logo-red.svg" alt="" />
            <span>Instagram</span>
          </span>
        </div>
        <a className="ig-handle" href={profile.url} target="_blank" rel="noreferrer">
          @{profile.handle} ↗
        </a>
      </header>

      <main className="ig-main">
        {/* ---------- top: who + numbers (left), the real profile (right) ---------- */}
        <section className="ig-hero">
          <motion.div className="ig-id" {...rise()}>
            <p className="ig-turn">
              <span>Turn 3</span> Instagram
            </p>
            <div className="ig-who">
              <span className="ig-avatar">
                <img src={profile.avatar} alt={profile.name} />
              </span>
              <div>
                <h1>
                  Product
                  <br />
                  Walaah<i>.</i>
                </h1>
                <p className="ig-at">
                  <IgIcon /> @{profile.handle}
                </p>
              </div>
            </div>
            <p className="ig-bio">{profile.bio}</p>
            <ul className="ig-topics">
              {profile.topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <a className="ig-follow" href={profile.url} target="_blank" rel="noreferrer">
              Follow on Instagram <span aria-hidden="true">→</span>
            </a>
          </motion.div>

          {/* the profile, rebuilt in code the way Instagram shows it */}
          <motion.figure className="ig-shot" {...rise(0.15)}>
            <div className="ig-app">
              <div className="ig-app-top">
                <span className="ig-app-user">{profile.handle}</span>
                <span className="ig-app-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div className="ig-app-row">
                <span className="ig-app-avatar">
                  <img src={profile.avatar} alt="" />
                </span>
                <dl className="ig-app-counts">
                  <div>
                    <dd>{profile.posts}</dd>
                    <dt>posts</dt>
                  </div>
                  <div>
                    <dd>{profile.followers}</dd>
                    <dt>followers</dt>
                  </div>
                  <div>
                    <dd>{profile.following}</dd>
                    <dt>following</dt>
                  </div>
                </dl>
              </div>
              <p className="ig-app-name">{profile.name}</p>
              <p className="ig-app-bio">{profile.igBio}</p>
              <a className="ig-app-link" href={`https://${profile.link}`} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
                </svg>
                {profile.link}
              </a>
              <div className="ig-app-btns">
                <a href={profile.url} target="_blank" rel="noreferrer" className="is-blue">
                  Follow
                </a>
                <a href={profile.url} target="_blank" rel="noreferrer">
                  Message
                </a>
              </div>
            </div>
            <figcaption>Live profile · {profile.updated}</figcaption>
          </motion.figure>

          <motion.dl className="ig-stats" {...rise(0.25)}>
            {stats.map(([n, k]) => (
              <div key={k}>
                <dd>{n}</dd>
                <dt>{k}</dt>
              </div>
            ))}
          </motion.dl>
        </section>

        {/* ---------- the feature ---------- */}
        <motion.section className="ig-feature" {...rise()}>
          <a className="ig-feature-shot" href={reelUrl(featured.reel)} target="_blank" rel="noreferrer">
            <img src={`/images/instagram/${featured.reel}.webp`} alt={`${featured.title} reel`} />
            <span className="ig-play" aria-hidden="true">
              ▶
            </span>
          </a>
          <div className="ig-feature-body">
            <p className="ig-label">Featured project</p>
            <h2>
              {featured.title}
              <small lang="hi">{featured.titleHi}</small>
            </h2>
            <p className="ig-feature-text">{featured.blurb}</p>
            <dl className="ig-feature-stats">
              {featured.stats.map(([n, k]) => (
                <div key={k}>
                  <dd>{n}</dd>
                  <dt>{k}</dt>
                </div>
              ))}
            </dl>
            <div className="ig-feature-ctas">
              <a className="ig-btn ig-btn--dark" href={featured.play} target="_blank" rel="noreferrer">
                Play the game <span aria-hidden="true">↗</span>
              </a>
              <a className="ig-btn" href={reelUrl(featured.reel)} target="_blank" rel="noreferrer">
                Watch the reel <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </motion.section>

        {/* ---------- reels ---------- */}
        <section className="ig-reels" aria-labelledby="ig-reels-title">
          <motion.div className="ig-reels-head" {...rise()}>
            <div>
              <p className="ig-label ig-label--dark">The feed</p>
              <h2 id="ig-reels-title">Every reel, with its numbers</h2>
            </div>
            <a href={profile.url} target="_blank" rel="noreferrer">
              See all on Instagram ↗
            </a>
          </motion.div>
          <ul className="ig-grid">
            {reels.map((r, i) => (
              <motion.li key={r.id} className="ig-card" {...rise(Math.min(i, 5) * 0.06)}>
                <a className="ig-card-shot" href={reelUrl(r.id)} target="_blank" rel="noreferrer" aria-label={`${r.title} — watch on Instagram`}>
                  <img src={`/images/instagram/${r.id}.webp`} alt="" loading="lazy" decoding="async" />
                  {r.id === top.id && <span className="ig-top">Top reel</span>}
                  <span className="ig-views">
                    <Play /> {compact(r.views)}
                  </span>
                </a>
                <div className="ig-card-body">
                  <p className="ig-card-meta">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {fmt(r.date)}
                  </p>
                  <a className="ig-card-title" href={reelUrl(r.id)} target="_blank" rel="noreferrer">
                    {r.title}
                  </a>
                  <div className="ig-engage">
                    <span title={`${r.likes.toLocaleString('en-IN')} likes`}>
                      <Heart /> {compact(r.likes)}
                    </span>
                    <span title={`${r.comments.toLocaleString('en-IN')} comments`}>
                      <Bubble /> {compact(r.comments)}
                    </span>
                    <ShareButton reel={r} />
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
          <p className="ig-note">Views, likes and comments from the public profile · updated {profile.updated}</p>
        </section>
      </main>
    </div>
  )
}
