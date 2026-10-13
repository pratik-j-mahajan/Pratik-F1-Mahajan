import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'
import { initAnalytics } from './analytics.js'

// Every full page load — a refresh, a typed URL or an opened link — restarts the site
// from the beginning: home page, intro included, About pass reset.
// Capture mode (add ?capture to any address, e.g. /about?capture): opens that page directly with
// no intro and no pass scan — for importing pages into Figma (html.to.design) or screenshots.
export const CAPTURE = new URLSearchParams(window.location.search).has('capture')
window.__capture = CAPTURE
if (CAPTURE) {
  try {
    // /about?capture&gate shows the ID-pass scan screen instead of skipping it
    if (new URLSearchParams(window.location.search).has('gate')) {
      sessionStorage.removeItem('about-pass')
      localStorage.removeItem('about-pass-seen')
    }
    else sessionStorage.setItem('about-pass', '1')
  } catch {
    // storage blocked
  }
} else {
  try {
    sessionStorage.removeItem('about-pass')
  } catch {
    // storage blocked — nothing to reset
  }
  if (window.location.pathname !== '/') window.history.replaceState(null, '', '/')
}

initAnalytics()

// The intro draws no text, so the browser wouldn't ask for the fonts until the site appears —
// start the main weights downloading now, while the intro plays, so the home page paints in its real fonts.
const EARLY_FONTS = ['300 1em Poppins', '400 1em Poppins', '600 1em Poppins', '700 1em Poppins', '600 1em "Titillium Web"', '700 1em "Titillium Web"', '400 1em Jost', 'italic 700 1em Kanit']
EARLY_FONTS.forEach((f) => document.fonts?.load(f).catch(() => {}))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
