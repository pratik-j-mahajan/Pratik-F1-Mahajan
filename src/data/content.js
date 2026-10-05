/*
  Content page — the LinkedIn season. EVERYTHING below except the 1M+ / 3-month headline is
  placeholder: replace with your real numbers from LinkedIn analytics, and paste each post's URL.

  `weekly`   impressions per week since you started (one number per week, oldest first).
             The chart's total line is the running sum, so the last total should match `impressions`.
  `thumb`    the post's image (put it in /public/images/posts/ and write '/images/posts/name.jpg').
             Leave it empty and the page draws a clean cover from the post's first line instead.
  `format`   'carousel' | 'image' | 'text' — how the post was published (shown on the cover).
  `embed`    LinkedIn's embed URL for the post (from "Embed this post" → the iframe's src). When set,
             the page shows the real LinkedIn post instead of a generated cover.
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
    id: 'google-maps-landmarks',
    // paste LinkedIn's "Embed this post" iframe src here; the page shows the real post
    embed: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7511665785371828225',
    embedHeight: 1426, // the height LinkedIn gives in the embed code (at 504px wide)
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7511665785371828225/',
    date: '2026-10-02',
    week: 14,
    topic: 'UX research',
    format: 'image',
    thumb: '',
    hook: '“Bhaiya, mandir se left, phir petrol pump ke baad right.” How Google Maps learned to give directions the Indian way.',
    impressions: 0,
    reactions: 68,
    comments: 13,
  },
  {
    id: 'ai-switching-problem',
    embed: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7508406316483182592',
    embedHeight: 1090,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7508406316483182592/',
    date: '2026-09-23',
    week: 13,
    topic: 'AI & UX',
    format: 'image',
    thumb: '',
    hook: 'AI was supposed to save me time. ChatGPT, Claude, Gemini, Perplexity… this isn’t a tool problem — it’s a switching problem.',
    impressions: 0,
    reactions: 55,
    comments: 25,
  },
  {
    id: 'figma-blend-plugin',
    embed: 'https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7500878080538816513',
    embedHeight: 1084,
    url: 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7500878080538816513/',
    date: '2026-09-02',
    week: 10,
    topic: 'Design tools',
    format: 'image',
    thumb: '',
    hook: 'This Figma plugin turns one shape into a hundred 🔥 Meet Blend — it copies an object along a path in one click.',
    impressions: 0,
    reactions: 130,
    comments: 9,
  },
  {
    id: 'blinkit-receiver',
    embed: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7500051209689681921',
    embedHeight: 1699,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7500051209689681921/',
    date: '2026-08-31',
    week: 10,
    topic: 'Product thinking',
    format: 'image',
    thumb: '',
    hook: 'Blinkit could save a thousand calls a day — with one extra step: “Who will receive this order?”',
    impressions: 0,
    reactions: 68,
    comments: 18,
  },
  {
    id: 'canva-flyers',
    embed: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7498726287000276995?collapsed=1',
    embedHeight: 670,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7498726287000276995/',
    date: '2026-08-27',
    topic: 'Visual design',
    format: 'image',
    thumb: '',
    hook: 'PLEASEEEE go back to Canva 😭🙏 Not every flyer needs to look like it was designed by ChatGPT at 2 AM.',
    impressions: 0,
    reactions: 29,
    comments: 3,
  },
  {
    id: 'whatsapp-group-plans',
    embed: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7498252118970130432',
    embedHeight: 1720,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7498252118970130432/',
    date: '2026-08-26',
    topic: 'UX concept',
    format: 'image',
    thumb: '',
    hook: 'WhatsApp has a group chat problem nobody’s fixed — the “where are we meeting” thread always gets buried.',
    impressions: 0,
    reactions: 131,
    comments: 75,
  },
  {
    id: 'instagram-rebrand',
    embed: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7497511482449043456',
    embedHeight: 1279,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7497511482449043456/',
    date: '2026-08-24',
    topic: 'Branding',
    format: 'image',
    thumb: '',
    hook: 'Instagram just redesigned its brand for 3 billion people. Not 3 million. Billion.',
    impressions: 0,
    reactions: 29,
    comments: 7,
  },
  {
    id: 'whatsapp-back-to-where',
    embed: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7478084959367426048',
    embedHeight: 1279,
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7478084959367426048/',
    date: '2026-07-01',
    topic: 'UX concept',
    format: 'image',
    thumb: '',
    hook: 'Is WhatsApp missing this one feature? A way back to where you were, after scrolling 500 messages deep.',
    impressions: 0,
    reactions: 76,
    comments: 14,
  },
]
