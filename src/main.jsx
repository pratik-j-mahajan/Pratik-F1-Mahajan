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
    sessionStorage.setItem('about-pass', '1')
    localStorage.setItem('home-hint-done', '1')
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
