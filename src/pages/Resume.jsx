import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BackButton from '../components/BackButton.jsx'
import '../styles/cases.css'
import '../styles/resume.css'

/*
  Resume — the PDF, shown as sharp page images (they render the same on every phone and browser)
  with a download button. To update: replace public/resume.pdf and the page images in
  public/resume/ (page-1.webp, page-2.webp).
*/
const PDF = '/resume.pdf'
const FILE_NAME = 'Pratik-Mahajan-Resume.pdf'
const PAGES = [
  { src: '/resume/page-1.webp', w: 1488, h: 2104 },
  { src: '/resume/page-2.webp', w: 1488, h: 600 },
]

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" />
  </svg>
)

export default function Resume() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <div className="cw rs">
      <header className={`cw-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="cw-nav-left">
          <BackButton />
          <span className="cw-brand">
            <img src="/images/f1-logo-red.svg" alt="" />
            <span>Resume</span>
          </span>
        </div>
        <nav className="cw-nav-right">
          <a className="rs-btn" href={PDF} download={FILE_NAME}>
            <DownloadIcon /> Download
          </a>
        </nav>
      </header>

      <main className="rs-main">
        <div className="rs-bar">
          <div>
            <h1 className="rs-title">Pratik Mahajan</h1>
            <p className="rs-meta">Product Designer · Resume · PDF</p>
          </div>
          <div className="rs-actions">
            <a className="rs-link" href={PDF} target="_blank" rel="noreferrer">
              Open PDF <span aria-hidden="true">↗</span>
            </a>
            <a className="rs-btn rs-btn--big" href={PDF} download={FILE_NAME}>
              <DownloadIcon /> Download resume
            </a>
          </div>
        </div>

        <div className="rs-paper">
          {PAGES.map((p, i) => (
            <motion.img
              key={p.src}
              src={p.src}
              width={p.w}
              height={p.h}
              alt={i === 0 ? 'Resume of Pratik Mahajan, page 1' : `Resume page ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>

        <p className="rs-foot">
          Links in the resume work in the PDF —{' '}
          <a href={PDF} target="_blank" rel="noreferrer">
            open it
          </a>{' '}
          or{' '}
          <a href={PDF} download={FILE_NAME}>
            download it
          </a>
          .
        </p>
      </main>
    </div>
  )
}
