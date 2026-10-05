/*
  Case studies — read by the index (/case-study) and each case page (/case-study/:slug).

  All copy below is placeholder written to be replaced — keep it short; the pages are
  overviews, not articles. Full write-ups live on Behance (paste each link into `behance`).
  `link`: when set, the card's "View case study" opens that URL (external links open in a new tab).
  `comingSoon`: a placeholder card with no cover; its `link` goes to the 404 page for now.

  `cover`    the project's key visual (in /public/images/cases), shown at 16:10
  `accent`   the project's colour
  `streak`   which column of the cover is smeared into the photo-finish streak (a % across the image)
  `focus`    object-position for the cover when it's cropped into a lane
  `screens`  optional real screens for the case page: [{ src, caption }]. Leave empty to hide.
*/

export const BEHANCE_PROFILE = 'https://www.behance.net/' // ← your Behance profile URL

const caseStudies = [
  {
    slug: 'united-upi',
    index: '01',
    name: 'United UPI',
    category: 'Fintech · UX case study',
    oneLiner: 'One view of spending across every UPI app.',
    headline: 'Digital India pays widely. But tracks partially.',
    role: 'UX designer',
    timeline: '10 weeks',
    year: '2026',
    cover: '/images/cases/united-upi.webp',
    accent: '#ff6a1a',
    streak: '66%',
    focus: '54% 45%',
    behance: 'https://pratik-j-mahajan.github.io/UNITED-UPI---Case-Study/',
    link: 'https://pratik-j-mahajan.github.io/UNITED-UPI---Case-Study/', // the card's "View case study" opens this directly
    problem:
      'Payments are spread across PhonePe, Google Pay, BHIM and more. Nobody has a clear picture of what they spent, what they owe or which cashback is about to expire.',
    approach: {
      intro: 'Designed around three everyday jobs.',
      decisions: [
        { title: 'See everything', body: 'Clear visibility of money spent across all UPI apps, in one timeline.' },
        { title: 'Split across apps', body: 'Easy, seamless bill splitting — whichever app your friends use.' },
        { title: 'Never miss cashback', body: 'Timely cashback awareness before it expires.' },
      ],
    },
    screens: [],
    outcome:
      'A single place to see, split and track money across every UPI app — built on real payment behaviour in India.',
  },
  {
    slug: 'my-things',
    index: '02',
    name: 'My Things',
    category: 'Mobile app · Product design',
    oneLiner: 'A simple way to remember everything you own.',
    headline: 'Everything you own, remembered in one calm place.',
    role: 'Product designer',
    timeline: '8 weeks',
    year: '2025',
    cover: '/images/cases/my-things.webp',
    accent: '#1f6bff',
    streak: '58%',
    focus: '50% 40%',
    behance: 'https://www.behance.net/gallery/256063241/My-Things',
    link: 'https://www.behance.net/gallery/256063241/My-Things', // the card's "View case study" opens this directly
    problem:
      'Receipts, warranties and where things are kept end up scattered across notes, photos and memory — so the moment you need something, the details are gone.',
    approach: {
      intro: 'Three decisions shaped the product.',
      decisions: [
        { title: 'Capture first', body: 'Adding an item takes a photo and a name. Everything else can wait.' },
        { title: 'Find by place', body: 'Things are grouped the way people remember them — by room and by box.' },
        { title: 'Quiet by default', body: 'No feeds, no badges. The app only speaks up when a warranty is about to end.' },
      ],
    },
    screens: [],
    outcome:
      'A focused, low-effort way to catalogue belongings and find them again — designed end to end, from first capture to reminders.',
  },
  {
    // placeholder card: no page yet — its button leads to the 404 page
    slug: 'coming-soon',
    index: '03',
    comingSoon: true,
    name: 'Coming soon',
    category: 'Case study · In the garage',
    oneLiner: 'Something new is being built in the garage. Check back soon.',
    year: '2026',
    cover: '',
    accent: '#e10600',
    link: '/coming-soon',
  },
]

export const getCaseStudy = (slug) => caseStudies.find((c) => c.slug === slug && !c.comingSoon)
// the case pages (prev / next) only step through real case studies
export const realCaseStudies = caseStudies.filter((c) => !c.comingSoon)

export default caseStudies
