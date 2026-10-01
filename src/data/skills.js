import { siFigma, siFramer } from 'simple-icons'

// The tools on the About ticket — only the ones in daily use. `icon` is a simple-icons entry;
// Adobe apps aren't in simple-icons, so they use a lettered `badge`.
export const tools = [
  { name: 'Figma', icon: siFigma },
  { name: 'Framer', icon: siFramer },
  { name: 'Photoshop', badge: { text: 'Ps', fg: '#31A8FF', bg: '#001E36' } },
  { name: 'Illustrator', badge: { text: 'Ai', fg: '#FF9A00', bg: '#330000' } },
  { name: 'After Effects', badge: { text: 'Ae', fg: '#9999FF', bg: '#00005B' } },
]
