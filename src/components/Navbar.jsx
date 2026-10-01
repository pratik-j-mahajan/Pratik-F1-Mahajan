import { Link, useLocation } from 'react-router-dom'
import TopBar from './TopBar'
import BackButton from './BackButton.jsx'

export default function Navbar() {
  const { pathname } = useLocation()
  // About, Content and Case Study are full-screen with their own headers
  if (pathname === '/about' || pathname === '/content' || pathname.startsWith('/case-study')) return null

  const home = pathname === '/'
  // The map keeps only the white strip — its logo lives in the sidebar
  if (pathname === '/map') {
    return (
      <header className="navbar navbar--map">
        <TopBar />
      </header>
    )
  }
  const variant = home ? ' navbar--home' : ' navbar--page'

  return (
    <header className={`navbar${variant}`}>
      {home && <TopBar />}
      {!home && <BackButton className="navbar-back" />}
      <Link to="/" className="navbar-logo" aria-label="Home">
        <img src={home ? '/images/f1-logo-red-v2.svg' : '/images/f1-logo-red.svg'} alt="F1" />
      </Link>
      {home && (
        <nav className="navbar-links" aria-label="Main">
          <Link to="/about">About</Link>
          <a href="/resume.pdf" download>
            Resume
          </a>
          <Link to="/contact">Contact</Link>
        </nav>
      )}
    </header>
  )
}
