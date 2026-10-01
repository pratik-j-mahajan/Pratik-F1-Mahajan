/*
  About page copy — everything the profile shows after the pass is scanned.
  Kept deliberately short: the page should read at a glance.
*/

export const profile = {
  first: 'Pratik',
  last: 'Mahajan',
  role: 'Product designer',
  number: '06',
  country: 'IND',
  base: 'Pune, India',
  timeZone: 'Asia/Kolkata',
  photo: '/images/about/pratik-id.jpg',
  // one line per row of the big headline
  headline: ['I turn messy ideas', 'into interfaces', 'people enjoy'],
  intro: 'Product designer based in Pune, India. Only argues with Figma auto-layout occasionally.',
  now: 'Designing things you’ll want to click twice.',
}

// What I do — shown as the ticket's access zones. `tools` are names from src/data/skills.js;
// they light up on the ticket when the zone is pointed at.
export const disciplines = [
  { name: 'Product Design', tools: ['Figma', 'Framer'] },
  { name: 'Visual Design', tools: ['Figma', 'Photoshop', 'Illustrator'] },
  { name: 'User Experience', tools: ['Figma', 'Framer'] },
  { name: 'User Interface', tools: ['Figma', 'Framer', 'After Effects'] },
]

// Social links shown in the footer. Empty ones are hidden.
export const links = {
  linkedin: '',
  behance: 'https://www.behance.net/',
  instagram: '',
}
