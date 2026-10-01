import { useEffect } from 'react'
import Lenis from 'lenis'

/*
  Gentle smooth scrolling for mouse wheels and trackpads — the page eases a touch behind
  the input for a slightly weighted feel. Touch scrolling stays native, reduced-motion
  users get plain scrolling, and pages that lock scrolling (html overflow: hidden, e.g.
  home and the About gate) are left alone.
*/
export default function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.1, // lower = more glide; 0.1 is subtle
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
      // don't scroll pages that are meant to stay put
      virtualScroll: () => getComputedStyle(document.documentElement).overflowY !== 'hidden',
    })
    window.__lenis = lenis

    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    })

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}
