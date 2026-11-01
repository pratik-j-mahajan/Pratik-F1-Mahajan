/*
  Instagram (Turn 3) — @productwalaah. Profile counts checked Nov 1, 2026;
  update them here as they grow. Instagram doesn't make share counts public, so reels get a
  Share button instead.
  `reels`: newest first. `id` is the code in the reel's link (instagram.com/reel/<id>/) and the
  thumbnail lives at /public/images/instagram/<id>.webp.
*/
export const profile = {
  name: 'Product Walaah',
  handle: 'productwalaah',
  url: 'https://www.instagram.com/productwalaah/',
  avatar: '/images/instagram/avatar.webp',
  bio: 'Design thinker — user interfaces, user experience, industrial design and motion. Building in public with AI.',
  topics: ['Product design', 'UI/UX', 'Tech', 'AI'],
  followers: '675',
  following: '8',
  posts: '16',
  igBio: 'Design thinker | User Interfaces | User Experience | Industrial Design | Motion | linkedin 1.5M+ views',
  link: 'the-jantar-mantar-run.vercel.app',
  updated: 'Nov 1, 2026',
}

// Account Insights screenshot supplied Nov 1, 2026. Reporting period not shown.
export const insights = {
  views: 2852250,
  viewers: 2061918,
  interactions: 485542,
  followerViewsPercent: 1.2,
  nonFollowerViewsPercent: 98.8,
  reelViewsPercent: 99.4,
  storyViewsPercent: 0.5,
  postViewsPercent: 0,
}

// the project the account is built around right now
export const featured = {
  title: 'The Jantar Mantar Run',
  titleHi: 'द जंतर मंतर रन',
  blurb: 'A browser runner game I designed and shipped — and the reel series that took it from launch to a crowd.',
  stats: [
    ['3M+', 'Views'],
    ['65K+', 'Players'],
  ],
  play: 'https://the-jantar-mantar-run.vercel.app',
  reel: 'DevkLvqoSGM',
}

export const reels = [
  { id: 'DewVTqTIBkU', date: '2026-10-21', title: 'The Jantar Mantar Run — game link in bio', views: 416, likes: 11, comments: 6 },
  { id: 'DevkLvqoSGM', date: '2026-10-20', title: 'New character unlocked: Chhota Badmosh', views: 25000, likes: 756, comments: 25 },
  { id: 'Det9F5EoVt5', date: '2026-10-20', title: 'Chhota Badmosh — the Dussehra update', views: 34900, likes: 1454, comments: 115 },
  { id: 'DercuMlIEFT', date: '2026-10-19', title: 'New character unlocked: “Hum bhi aaye hain.”', views: 812000, likes: 38000, comments: 633 },
  { id: 'Deoy9JnIRFG', date: '2026-10-18', title: 'Jantar Mantar tak pahunchna = Hard mode', views: 1700000, likes: 121000, comments: 902 },
  { id: 'Deow9hDIgtK', date: '2026-10-18', title: 'This week’s challenge — beat the score', views: 7753, likes: 187, comments: 6 },
  { id: 'DemGnYQoyyo', date: '2026-10-17', title: 'Jantar Mantar pahunchna ab officially ek game hai', views: 10700, likes: 241, comments: 14 },
]

export const reelUrl = (id) => `https://www.instagram.com/${profile.handle}/reel/${id}/`

// 1700000 → "1.7M", 34900 → "34.9K", 756 → "756"
export const compact = (n) =>
  n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}K` : String(n)

const sum = (k) => reels.reduce((a, r) => a + r[k], 0)
export const totals = { views: sum('views'), likes: sum('likes'), comments: sum('comments') }

// for "+" totals: round down so a figure is never overstated (2,590,769 → "2.5M", 161,649 → "161K")
export const floorCompact = (n) =>
  n >= 1e6 ? `${Math.floor(n / 1e5) / 10}M` : n >= 1e3 ? `${Math.floor(n / 1e3)}K` : String(n)

// Latest non-pinned posts verified on the profile, Nov 1, 2026.
// Engagement counts omitted until verified; missing values are not zero.
export const latestPosts = [
  { id: 'DfKSgvfI9SD', title: 'Dr. Driving, reimagined with AI', kind: 'reel' },
  { id: 'DfJZ2HeoxBR', title: 'Hill Climb Racing — same terrible driving', kind: 'reel' },
  { id: 'DfFFddmiCqw', title: 'Same icons. Extra grain.', kind: 'p' },
  { id: 'De_KYhxooGl', title: 'AI gave him hair. Then workplace anxiety.', kind: 'reel' },
].map(post => ({ ...post, thumbnail: `/images/instagram/${post.id}.jpg` }))
export const postUrl = (post) => `https://www.instagram.com/productwalaah/${post.kind || 'reel'}/${post.id}/`
