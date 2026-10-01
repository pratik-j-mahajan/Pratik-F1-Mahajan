/*
  Content page — the LinkedIn season. EVERYTHING below except the 1M+ / 3-month headline is
  placeholder: replace with your real numbers from LinkedIn analytics, and paste each post's URL.

  `weekly`   impressions per week since you started (one number per week, oldest first).
             The chart's total line is the running sum, so the last total should match `impressions`.
  `thumb`    the post's image (put it in /public/images/posts/ and write '/images/posts/name.jpg').
             Leave it empty and the page draws a clean cover from the post's first line instead.
  `format`   'carousel' | 'image' | 'text' — how the post was published (shown on the cover).
  `posts`    every post you want the page to know about — add new ones as you publish and
             refresh the numbers now and then. The page picks the latest 3 (by date) and the best 3
             (views + weighted reactions and comments) on its own.
              `week` = which week (1-based) it went out, so it sits on the chart.
*/

export const LINKEDIN_PROFILE = 'https://www.linkedin.com/in/pratik-j-mahajan/'

export const author = {
  name: 'Pratik Mahajan',
  role: 'Product designer',
  avatar: '/images/about/pratik-id.jpg',
}

export const season = {
  startedOn: '2026-06-29', // first post
  impressions: 1000000, // shown as 1,000,000+
  totals: [
    { label: 'Posts', value: '38' },
    { label: 'Reactions', value: '21.4K' },
    { label: 'Comments', value: '2.3K' },
    { label: 'New followers', value: '+6.8K' },
  ],
  weekly: [3200, 7400, 12800, 21500, 34000, 52000, 88000, 118000, 96000, 142000, 158000, 136000, 131100],
}

export const posts = [
  {
    id: 'p1',
    week: 2,
    date: '2026-07-09',
    topic: 'Process',
    format: 'carousel',
    thumb: '',
    hook: 'I redesigned the same screen 14 times. Here’s what the 14th version taught me that the first 13 didn’t.',
    impressions: 18400,
    reactions: 412,
    comments: 63,
    url: '',
  },
  {
    id: 'p2',
    week: 5,
    date: '2026-07-30',
    topic: 'UX',
    format: 'image',
    thumb: '',
    hook: 'Your users don’t read. They scan, guess and click. Design for the guess.',
    impressions: 41200,
    reactions: 980,
    comments: 121,
    url: '',
  },
  {
    id: 'p3',
    week: 7,
    date: '2026-08-12',
    topic: 'Case study',
    format: 'carousel',
    thumb: '',
    hook: 'Indians pay across five UPI apps and track spending in none. So I designed one view for all of them.',
    impressions: 186000,
    reactions: 4100,
    comments: 512,
    url: '',
  },
  {
    id: 'p4',
    week: 8,
    date: '2026-08-20',
    topic: 'Career',
    format: 'text',
    thumb: '',
    hook: 'No design degree. No big-brand internship. Here’s the portfolio that still got replies.',
    impressions: 94300,
    reactions: 2250,
    comments: 340,
    url: '',
  },
  {
    id: 'p5',
    week: 10,
    date: '2026-09-02',
    topic: 'Motion',
    format: 'carousel',
    thumb: '',
    hook: 'Motion isn’t decoration. It’s the interface explaining itself. Three examples.',
    impressions: 67800,
    reactions: 1530,
    comments: 188,
    url: '',
  },
  {
    id: 'p6',
    week: 12,
    date: '2026-09-17',
    topic: 'Milestone',
    format: 'image',
    thumb: '',
    hook: '1,000,000 impressions in three months. What actually moved the needle (and what didn’t).',
    impressions: 122500,
    reactions: 3380,
    comments: 455,
    url: '',
  },
]
