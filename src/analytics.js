/*
  Google Analytics 4. Paste your Measurement ID below (Google Analytics → Admin → Data streams →
  your web stream → "Measurement ID", it looks like G-XXXXXXXXXX). While it's empty, nothing
  loads and nothing is tracked.

  What gets recorded:
  - a page view for every page (this is a one-page app, so views are sent on each route change)
  - outbound clicks: LinkedIn posts, Behance, case-study links, social profiles (event: click_outbound)
  - résumé downloads / opens (event: resume_download)
  - email clicks (event: contact_email)
  - START pressed on the home page (event: start_race)
*/
export const GA_ID = 'G-BSDHXSM9R7'

let ready = false

export function initAnalytics() {
  if (!GA_ID || ready || typeof window === 'undefined') return
  ready = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments) // eslint-disable-line prefer-rest-params
  }
  window.gtag('js', new Date())
  // page views are sent by hand on each route change (see trackPage)
  window.gtag('config', GA_ID, { send_page_view: false })

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  // one listener for every link on the site: outbound, résumé, email
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest?.('a[href]')
      if (!a) return
      const href = a.getAttribute('href')
      if (href.startsWith('mailto:')) return track('contact_email')
      if (/resume\.pdf$/.test(href) || href === '/resume') return track('resume_download', { link_url: href, method: a.hasAttribute('download') ? 'download' : 'open' })
      if (/^https?:/.test(href) && !href.startsWith(window.location.origin)) {
        track('click_outbound', { link_url: href, link_domain: new URL(href).hostname, link_text: a.textContent.trim().slice(0, 80) })
      }
    },
    { capture: true },
  )
}

export function trackPage(path) {
  if (!ready) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: document.title,
  })
}

export function track(name, params = {}) {
  if (!ready) return
  window.gtag('event', name, params)
}
