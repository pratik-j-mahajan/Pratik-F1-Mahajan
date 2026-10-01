import { useEffect, useLayoutEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Intro from './components/Intro.jsx'
import Navbar from './components/Navbar.jsx'
import { SectionTransitionProvider } from './components/SectionTransition.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import CaseLayout from './pages/cases/CaseLayout.jsx'
import CaseList from './pages/cases/CaseList.jsx'
import CaseDetail from './pages/cases/CaseDetail.jsx'
import Projects from './pages/Projects.jsx'
import Content from './pages/Content.jsx'
import Contact from './pages/Contact.jsx'
import Map from './pages/Map.jsx'
import useSmoothScroll from './hooks/useSmoothScroll.js'

const INTRO_DURATION = 4000
const INTRO_KEY = 'intro-seen'

// The intro plays once per visit, and only when the visit starts on the home page.
// Refreshes and deep links (e.g. /case-study/my-things) render the page straight away.
function shouldPlayIntro() {
  if (window.location.pathname !== '/') return false
  try {
    return !sessionStorage.getItem(INTRO_KEY)
  } catch {
    return true // storage blocked (private mode): decide by route only
  }
}

// New pages start at the top; Back/Forward and refreshes keep the browser's own scroll restoration.
function ScrollManager() {
  const { pathname } = useLocation()
  const type = useNavigationType()
  useLayoutEffect(() => {
    if (type !== 'PUSH' && type !== 'REPLACE') return
    // stop any smooth-scroll glide from the previous page, then jump to the top
    window.__lenis?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
  }, [pathname, type])
  return null
}

export default function App() {
  useSmoothScroll()
  const [showIntro, setShowIntro] = useState(shouldPlayIntro)

  useEffect(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // ignore — storage blocked
    }
  }, [])

  useEffect(() => {
    if (!showIntro) return
    const timer = setTimeout(() => setShowIntro(false), INTRO_DURATION)
    return () => clearTimeout(timer)
  }, [showIntro])

  return (
    <>
      <AnimatePresence>{showIntro && <Intro key="intro" />}</AnimatePresence>

      {!showIntro && (
        <SectionTransitionProvider>
          <ScrollManager />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* the 3D garage (src/pages/Garage.jsx) is parked for now; START goes straight to the map */}
              <Route path="/map" element={<Map />} />
              <Route path="/about" element={<About />} />
              <Route path="/case-study" element={<CaseLayout />}>
                <Route index element={<CaseList />} />
                <Route path=":slug" element={<CaseDetail />} />
              </Route>
              <Route path="/projects" element={<Projects />} />
              <Route path="/content" element={<Content />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
        </SectionTransitionProvider>
      )}
    </>
  )
}
