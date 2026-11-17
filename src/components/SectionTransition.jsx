import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowIcon } from './MapIcons.jsx'
import LowerThird from './LowerThird.jsx'
import '../styles/section-video.css'
import sections from '../data/sections.js'

const pad = (n) => String(n).padStart(2, '0')
const VOLUME = 0.25 // section videos play quietly (quarter volume), so they're never loud in an office
// Videos play with sound, at a low volume. A visitor can mute them with the speaker button,
// and that choice is remembered.
const SOUND_KEY = 'section-video-sound'
const readMuted = () => {
  try {
    return localStorage.getItem(SOUND_KEY) === 'off'
  } catch {
    return false
  }
}

const TransitionContext = createContext(() => {})

// Phones and slow / data-saver connections get the lighter 720p cut of each video.
const lightVideo = () => {
  if (typeof window === 'undefined') return false
  const c = navigator.connection
  return window.matchMedia('(max-width: 900px)').matches || c?.saveData || /(^|-)2g/.test(c?.effectiveType || '')
}
export const videoFor = (src) => (src && lightVideo() ? src.replace(/\.mp4$/, '-720.mp4') : src)

// Warm the browser cache with a section's video, so it starts instantly on click.
const warmed = new Set()
export function prefetchSectionVideo(src) {
  const url = videoFor(src)
  if (!url || warmed.has(url)) return Promise.resolve()
  warmed.add(url)
  return fetch(url, { priority: 'low' })
    .then((r) => r.blob())
    .catch(() => warmed.delete(url))
}

const STALL_MS = 8000 // if the video still hasn't started by then, go straight to the section

// Call with a section to play its video, then open the section page.
export const useSectionTransition = () => useContext(TransitionContext)

export function SectionTransitionProvider({ children }) {
  const navigate = useNavigate()
  const [section, setSection] = useState(null)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const skipRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const doneRef = useRef(false)
  const [muted, setMuted] = useState(readMuted)
  const [buffering, setBuffering] = useState(true)

  const toggleSound = () => {
    const next = !muted
    setMuted(next)
    const v = videoRef.current
    if (v) {
      v.muted = next
      v.volume = VOLUME
    }
    try {
      localStorage.setItem(SOUND_KEY, next ? 'off' : 'on')
      localStorage.removeItem('section-video-muted')
    } catch {
      /* fine */
    }
  }

  const play = useCallback((s) => {
    if (reducedMotion) {
      navigate(s.path)
      return
    }
    doneRef.current = false
    setProgress(0)
    setBuffering(true)
    setSection(s)
  }, [navigate, reducedMotion])

  // Open the section underneath, then fade the video away to reveal it.
  const finish = useCallback(() => {
    if (doneRef.current || !section) return
    doneRef.current = true
    navigate(section.path)
    setSection(null)
  }, [navigate, section])

  useEffect(() => {
    if (!section) return
    const video = videoRef.current
    if (video) {
      video.volume = VOLUME
      video.muted = muted
    }
    // A click started this, so sound is allowed; fall back to muted if the browser refuses.
    video?.play().catch(() => {
      video.muted = true
      setMuted(true)
      video.play().catch(finish)
    })
    // slow connection: don't leave people staring at a black screen
    const stall = setTimeout(() => {
      if (!video || video.currentTime < 0.05) finish()
    }, STALL_MS)
    skipRef.current?.focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); finish() }
      if (e.key === 'Tab') {
        const buttons = playerRef.current?.querySelectorAll('button')
        if (!buttons?.length) return
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(stall)
      window.removeEventListener('keydown', onKey)
    }
  }, [section, finish]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TransitionContext.Provider value={play}>
      <div inert={section ? true : undefined} style={{ display: 'contents' }}>{children}</div>

      <AnimatePresence>
        {section && (
          <motion.div
            key={section.id}
            ref={playerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${section.title} section intro`}
            className="section-video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
            transition={{ duration: 0.4 }}
          >
            <video
              ref={videoRef}
              src={videoFor(section.video)}
              muted={muted}
              playsInline
              preload="auto"
              onEnded={finish}
              onError={finish}
              onPlaying={() => setBuffering(false)}
              onWaiting={() => setBuffering(true)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                if (v.duration) setProgress(v.currentTime / v.duration)
              }}
            />

            <div className="sv-flow-plane">
              <div className="sv-flow-credit">
                <span>Video generated via</span>
                <strong>Google Flow</strong>
              </div>
              <svg className="sv-flow-annotation" viewBox="0 0 1920 1080" fill="none" aria-hidden="true">
                <path className="sv-hand-circle" d="M1742 850C1770 847 1793 870 1791 899C1789 930 1765 948 1737 947C1708 946 1689 924 1690 898C1690 871 1714 852 1742 850Z" />
                <path className="sv-leader-desktop sv-ink-stroke" d="M1587.5 817.6L1589.2 816.8L1590.7 815.9L1592.1 815.0L1593.6 814.3L1595.0 813.6L1596.5 812.9L1598.1 812.4L1599.6 811.9L1601.3 811.5L1602.9 811.2L1604.6 810.9L1606.4 810.9L1608.2 810.9L1610.0 811.0L1611.9 811.2L1613.7 811.5L1615.6 811.9L1617.6 812.4L1619.5 812.9L1621.5 813.4L1623.5 814.0L1625.6 814.7L1627.7 815.3L1629.8 816.0L1632.0 816.7L1634.1 817.4L1636.4 818.1L1638.6 819.0L1640.9 819.8L1643.1 820.8L1645.4 821.8L1647.6 822.9L1649.9 824.1L1652.1 825.3L1654.4 826.5L1656.6 827.9L1658.9 829.2L1661.1 830.6L1663.4 831.9L1665.6 833.3L1667.9 834.7L1670.2 836.0L1672.5 837.3L1674.8 838.6L1677.2 839.9L1679.5 841.2L1681.8 842.5L1684.1 843.8L1686.4 845.1L1688.7 846.5L1690.9 847.8L1693.1 849.1L1695.3 850.4L1697.7 851.5L1698.3 850.5L1696.4 848.8L1694.3 847.3L1692.2 845.8L1690.1 844.2L1688.0 842.7L1685.8 841.2L1683.7 839.6L1681.5 838.0L1679.3 836.5L1677.1 834.9L1674.9 833.4L1672.7 832.0L1670.4 830.5L1668.1 829.1L1665.8 827.8L1663.4 826.5L1661.1 825.3L1658.7 824.1L1656.4 822.9L1654.0 821.7L1651.7 820.6L1649.4 819.4L1647.1 818.3L1644.8 817.1L1642.6 816.0L1640.4 814.9L1638.1 813.9L1635.9 812.8L1633.7 811.9L1631.5 811.0L1629.3 810.2L1627.1 809.5L1624.9 808.9L1622.7 808.4L1620.6 808.0L1618.4 807.7L1616.3 807.5L1614.2 807.3L1612.2 807.3L1610.2 807.3L1608.2 807.3L1606.2 807.4L1604.3 807.6L1602.4 807.8L1600.6 808.1L1598.8 808.5L1597.0 809.0L1595.2 809.6L1593.5 810.4L1591.9 811.3L1590.3 812.3L1588.9 813.5L1587.5 814.8L1586.5 816.4ZM1679.7 851.5L1679.8 852.2L1680.1 852.6L1680.4 853.0L1680.8 853.3L1681.1 853.6L1681.5 853.9L1681.9 854.1L1682.3 854.3L1682.7 854.4L1683.1 854.6L1683.5 854.7L1683.9 854.8L1684.4 854.8L1684.8 855.0L1685.1 855.1L1685.5 855.2L1685.9 855.4L1686.3 855.6L1686.6 855.8L1687.0 856.0L1687.4 856.1L1687.8 856.3L1688.2 856.4L1688.6 856.5L1689.0 856.6L1689.4 856.6L1689.8 856.5L1690.1 856.5L1690.5 856.3L1690.9 856.2L1691.3 856.0L1691.6 855.9L1692.0 855.7L1692.4 855.6L1692.7 855.5L1693.1 855.4L1693.5 855.4L1693.8 855.3L1694.2 855.3L1694.6 855.2L1695.0 855.2L1695.3 855.1L1695.7 854.9L1696.0 854.8L1696.4 854.6L1696.7 854.3L1696.9 854.0L1697.2 853.7L1697.4 853.4L1697.7 853.0L1697.9 852.7L1698.1 852.3L1698.3 852.0L1698.3 851.4L1697.7 850.6L1697.2 850.5L1696.8 850.5L1696.4 850.6L1696.1 850.6L1695.7 850.6L1695.4 850.7L1695.1 850.7L1694.8 850.7L1694.5 850.8L1694.2 850.9L1693.9 851.0L1693.7 851.1L1693.5 851.2L1693.2 851.4L1693.0 851.5L1692.8 851.7L1692.5 851.8L1692.2 851.9L1692.0 852.0L1691.7 852.0L1691.4 852.0L1691.1 851.9L1690.9 851.8L1690.6 851.7L1690.3 851.6L1690.0 851.5L1689.8 851.5L1689.5 851.4L1689.2 851.4L1688.9 851.4L1688.6 851.4L1688.3 851.5L1688.0 851.6L1687.7 851.6L1687.4 851.7L1687.1 851.8L1686.7 851.8L1686.4 851.8L1686.1 851.7L1685.7 851.7L1685.4 851.5L1685.1 851.4L1684.8 851.2L1684.4 851.1L1684.1 850.9L1683.8 850.7L1683.4 850.6L1683.1 850.5L1682.7 850.4L1682.3 850.3L1681.9 850.3L1681.4 850.2L1680.9 850.2L1680.3 850.5ZM1698.6 850.7L1698.9 850.3L1699.0 850.0L1699.0 849.7L1699.0 849.4L1699.0 849.1L1699.0 848.8L1698.9 848.5L1698.8 848.2L1698.7 848.0L1698.5 847.7L1698.3 847.4L1698.2 847.2L1698.0 846.9L1697.9 846.6L1697.8 846.3L1697.7 845.9L1697.7 845.6L1697.7 845.3L1697.6 844.9L1697.7 844.5L1697.7 844.2L1697.7 843.8L1697.6 843.5L1697.6 843.1L1697.5 842.8L1697.4 842.4L1697.3 842.1L1697.1 841.8L1696.9 841.5L1696.7 841.2L1696.5 840.8L1696.3 840.5L1696.2 840.2L1696.1 839.8L1696.0 839.5L1695.9 839.2L1695.9 838.8L1695.9 838.4L1695.9 838.1L1695.9 837.7L1696.0 837.4L1696.0 837.1L1696.0 836.7L1695.9 836.4L1695.9 836.1L1695.8 835.8L1695.7 835.4L1695.5 835.1L1695.4 834.8L1695.3 834.5L1695.1 834.1L1695.0 833.8L1694.9 833.5L1694.5 833.1L1693.5 832.9L1693.0 833.2L1692.8 833.5L1692.6 833.9L1692.4 834.3L1692.2 834.6L1692.1 835.0L1691.9 835.4L1691.8 835.8L1691.8 836.2L1691.7 836.6L1691.7 837.0L1691.8 837.4L1691.9 837.8L1692.0 838.2L1692.1 838.6L1692.2 839.0L1692.3 839.3L1692.4 839.7L1692.5 840.1L1692.5 840.5L1692.5 840.9L1692.5 841.3L1692.5 841.7L1692.5 842.2L1692.5 842.6L1692.5 843.0L1692.5 843.4L1692.5 843.8L1692.6 844.2L1692.8 844.5L1692.9 844.9L1693.1 845.2L1693.4 845.6L1693.6 845.9L1693.8 846.2L1694.1 846.5L1694.3 846.8L1694.5 847.1L1694.6 847.5L1694.8 847.8L1694.9 848.1L1695.0 848.5L1695.1 848.8L1695.1 849.1L1695.2 849.4L1695.3 849.7L1695.5 850.0L1695.6 850.3L1695.8 850.5L1696.0 850.7L1696.3 850.9L1696.6 851.1L1696.9 851.3L1697.4 851.3Z" />
                <path className="sv-leader-mobile sv-ink-stroke" d="M1390.2 819.8L1395.4 819.1L1400.6 818.1L1405.9 817.1L1411.3 816.1L1416.8 815.2L1422.4 814.3L1428.1 813.5L1433.9 812.7L1439.8 812.1L1445.8 811.5L1451.8 811.0L1457.9 810.6L1464.1 810.3L1470.3 810.1L1476.6 810.0L1482.9 810.0L1489.2 810.1L1495.6 810.3L1502.0 810.5L1508.4 810.7L1514.9 811.0L1521.3 811.4L1527.8 811.7L1534.2 812.1L1540.6 812.5L1547.1 812.9L1553.5 813.5L1559.9 814.0L1566.2 814.7L1572.6 815.4L1578.8 816.3L1585.1 817.2L1591.2 818.2L1597.3 819.3L1603.3 820.6L1609.2 821.8L1615.1 823.2L1620.8 824.6L1626.5 826.0L1632.1 827.5L1637.6 829.0L1643.0 830.5L1648.3 832.0L1653.4 833.6L1658.5 835.1L1663.4 836.8L1668.2 838.4L1672.9 840.1L1677.4 841.9L1681.8 843.8L1685.9 845.7L1690.0 847.7L1693.8 849.7L1697.7 851.5L1698.3 850.5L1694.9 847.9L1691.1 845.6L1687.1 843.4L1683.0 841.2L1678.7 839.1L1674.2 837.0L1669.6 835.0L1664.8 833.0L1659.9 831.0L1654.9 829.1L1649.7 827.3L1644.4 825.6L1639.0 824.0L1633.4 822.5L1627.7 821.1L1622.0 819.8L1616.1 818.5L1610.2 817.3L1604.2 816.2L1598.1 815.1L1591.9 814.1L1585.7 813.1L1579.4 812.1L1573.1 811.2L1566.8 810.2L1560.4 809.4L1554.0 808.5L1547.6 807.8L1541.1 807.1L1534.6 806.5L1528.1 806.0L1521.6 805.6L1515.1 805.4L1508.6 805.2L1502.1 805.2L1495.6 805.2L1489.2 805.3L1482.8 805.5L1476.5 805.8L1470.1 806.1L1463.9 806.5L1457.7 806.9L1451.5 807.4L1445.4 807.9L1439.4 808.5L1433.5 809.1L1427.6 809.8L1421.9 810.6L1416.2 811.5L1410.7 812.5L1405.2 813.7L1399.9 814.9L1394.7 816.4L1389.8 818.2ZM1679.7 851.5L1679.8 852.2L1680.1 852.6L1680.4 853.0L1680.8 853.3L1681.1 853.6L1681.5 853.9L1681.9 854.1L1682.3 854.3L1682.7 854.4L1683.1 854.6L1683.5 854.7L1683.9 854.8L1684.4 854.8L1684.8 855.0L1685.1 855.1L1685.5 855.2L1685.9 855.4L1686.3 855.6L1686.6 855.8L1687.0 856.0L1687.4 856.1L1687.8 856.3L1688.2 856.4L1688.6 856.5L1689.0 856.6L1689.4 856.6L1689.8 856.5L1690.1 856.5L1690.5 856.3L1690.9 856.2L1691.3 856.0L1691.6 855.9L1692.0 855.7L1692.4 855.6L1692.7 855.5L1693.1 855.4L1693.5 855.4L1693.8 855.3L1694.2 855.3L1694.6 855.2L1695.0 855.2L1695.3 855.1L1695.7 854.9L1696.0 854.8L1696.4 854.6L1696.7 854.3L1696.9 854.0L1697.2 853.7L1697.4 853.4L1697.7 853.0L1697.9 852.7L1698.1 852.3L1698.3 852.0L1698.3 851.4L1697.7 850.6L1697.2 850.5L1696.8 850.5L1696.4 850.6L1696.1 850.6L1695.7 850.6L1695.4 850.7L1695.1 850.7L1694.8 850.7L1694.5 850.8L1694.2 850.9L1693.9 851.0L1693.7 851.1L1693.5 851.2L1693.2 851.4L1693.0 851.5L1692.8 851.7L1692.5 851.8L1692.2 851.9L1692.0 852.0L1691.7 852.0L1691.4 852.0L1691.1 851.9L1690.9 851.8L1690.6 851.7L1690.3 851.6L1690.0 851.5L1689.8 851.5L1689.5 851.4L1689.2 851.4L1688.9 851.4L1688.6 851.4L1688.3 851.5L1688.0 851.6L1687.7 851.6L1687.4 851.7L1687.1 851.8L1686.7 851.8L1686.4 851.8L1686.1 851.7L1685.7 851.7L1685.4 851.5L1685.1 851.4L1684.8 851.2L1684.4 851.1L1684.1 850.9L1683.8 850.7L1683.4 850.6L1683.1 850.5L1682.7 850.4L1682.3 850.3L1681.9 850.3L1681.4 850.2L1680.9 850.2L1680.3 850.5ZM1698.6 850.7L1698.9 850.3L1699.0 850.0L1699.0 849.7L1699.0 849.4L1699.0 849.1L1699.0 848.8L1698.9 848.5L1698.8 848.2L1698.7 848.0L1698.5 847.7L1698.3 847.4L1698.2 847.2L1698.0 846.9L1697.9 846.6L1697.8 846.3L1697.7 845.9L1697.7 845.6L1697.7 845.3L1697.6 844.9L1697.7 844.5L1697.7 844.2L1697.7 843.8L1697.6 843.5L1697.6 843.1L1697.5 842.8L1697.4 842.4L1697.3 842.1L1697.1 841.8L1696.9 841.5L1696.7 841.2L1696.5 840.8L1696.3 840.5L1696.2 840.2L1696.1 839.8L1696.0 839.5L1695.9 839.2L1695.9 838.8L1695.9 838.4L1695.9 838.1L1695.9 837.7L1696.0 837.4L1696.0 837.1L1696.0 836.7L1695.9 836.4L1695.9 836.1L1695.8 835.8L1695.7 835.4L1695.5 835.1L1695.4 834.8L1695.3 834.5L1695.1 834.1L1695.0 833.8L1694.9 833.5L1694.5 833.1L1693.5 832.9L1693.0 833.2L1692.8 833.5L1692.6 833.9L1692.4 834.3L1692.2 834.6L1692.1 835.0L1691.9 835.4L1691.8 835.8L1691.8 836.2L1691.7 836.6L1691.7 837.0L1691.8 837.4L1691.9 837.8L1692.0 838.2L1692.1 838.6L1692.2 839.0L1692.3 839.3L1692.4 839.7L1692.5 840.1L1692.5 840.5L1692.5 840.9L1692.5 841.3L1692.5 841.7L1692.5 842.2L1692.5 842.6L1692.5 843.0L1692.5 843.4L1692.5 843.8L1692.6 844.2L1692.8 844.5L1692.9 844.9L1693.1 845.2L1693.4 845.6L1693.6 845.9L1693.8 846.2L1694.1 846.5L1694.3 846.8L1694.5 847.1L1694.6 847.5L1694.8 847.8L1694.9 848.1L1695.0 848.5L1695.1 848.8L1695.1 849.1L1695.2 849.4L1695.3 849.7L1695.5 850.0L1695.6 850.3L1695.8 850.5L1696.0 850.7L1696.3 850.9L1696.6 851.1L1696.9 851.3L1697.4 851.3Z" />
              </svg>
            </div>

            {/* Original F1 TV broadcast UI. */}
            <span className="sv-shade" aria-hidden="true" />
            <motion.div
              className="sv-bug"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <span className="sv-live">
                <i /> Live
              </span>
              <img src="/images/f1tv-logo.svg" alt="F1 TV" />
              <span className="sv-event">Portfolio Grand Prix</span>
              {buffering && (
                <span className="sv-loading" role="status">
                  <i aria-hidden="true" /> Loading
                </span>
              )}
            </motion.div>

            <motion.button
              type="button"
              className={`sv-sound${muted ? ' is-muted' : ''}`}
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" />
                {muted ? <path d="m17 9 5 5m0-5-5 5" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
              </svg>
              <span>{muted ? 'Sound off' : 'Sound on'}</span>
              {!muted && (
                <span className="sv-eq" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </motion.button>

            <motion.div
              className="sv-lap"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <span>Lap</span>
              <b>{pad(sections.findIndex((x) => x.id === section.id) + 1)}</b>
              <em>/ {pad(sections.length)}</em>
            </motion.div>

            <LowerThird
              className="sv-lt"
              num={pad(sections.findIndex((x) => x.id === section.id) + 1)}
              title={section.title}
              sub={section.blurb}
              tail={section.turn}
              delay={0.5}
            />

            <button ref={skipRef} type="button" className="section-video-skip" onClick={finish} aria-label="Skip video (Esc)">
              <span className="section-video-skip-text">
                Skip <small>Esc</small>
              </span>
              <span className="section-video-skip-arrow">
                <ArrowIcon />
              </span>
            </button>

            <div className="section-video-progress">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  )
}
