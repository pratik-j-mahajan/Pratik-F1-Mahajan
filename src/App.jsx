import { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Intro from './components/Intro.jsx'
import Navbar from './components/Navbar.jsx'
import { SectionTransitionProvider } from './components/SectionTransition.jsx'
import Home from './pages/Home.jsx'

// Home loads with the app; every other page is its own download, fetched quietly in the
// background once home is up — so the first screen is light and later pages still open instantly.
const pages = {
  map: () => import('./pages/Map.jsx'),
  about: () => import('./pages/About.jsx'),
  caseLayout: () => import('./pages/cases/CaseLayout.jsx'),
  caseList: () => import('./pages/cases/CaseList.jsx'),
  caseDetail: () => import('./pages/cases/CaseDetail.jsx'),
  projects: () => import('./pages/Projects.jsx'),
  content: () => import('./pages/Content.jsx'),
  contact: () => import('./pages/Contact.jsx'),
  resume: () => import('./pages/Resume.jsx'),
  notFound: () => import('./pages/NotFound.jsx'),
}
const Map = lazy(pages.map)
const About = lazy(pages.about)
const CaseLayout = lazy(pages.caseLayout)
const CaseList = lazy(pages.caseList)
const CaseDetail = lazy(pages.caseDetail)
const Projects = lazy(pages.projects)
const Content = lazy(pages.content)
const Contact = lazy(pages.contact)
const Resume = lazy(pages.resume)
const NotFound = lazy(pages.notFound)

function usePrefetchPages() {
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200))
    const id = idle(() => Object.values(pages).forEach((load) => load().catch(() => {})))
    return () => (window.cancelIdleCallback || clearTimeout)(id)
  }, [])
}
import useSmoothScroll from './hooks/useSmoothScroll.js'

const INTRO_DURATION = 2000
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
  usePrefetchPages()
  // The intro plays on every full page load: a refresh, a typed URL or an opened link.
  // Moving around inside the site never replays it.
  const [showIntro, setShowIntro] = useState(true)

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
            <Suspense fallback={null}>
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
              <Route path="/resume" element={<Resume />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
        </SectionTransitionProvider>
      )}
    </>
  )
}
