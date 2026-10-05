import { siFigma, siFramer, siLottiefiles } from 'simple-icons'

// The tools on the About ticket — only the ones in daily use. `icon` is a simple-icons entry;
// Adobe apps and Canva aren't in simple-icons, so they use a lettered `badge`.
export const tools = [
  { name: 'Figma', icon: siFigma },
  { name: 'Framer', icon: siFramer },
  { name: 'LottieFiles', icon: siLottiefiles },
  { name: 'Canva', badge: { text: 'Ca', fg: '#FFFFFF', bg: '#00C4CC' } },
  { name: 'Illustrator', badge: { text: 'Ai', fg: '#FF9A00', bg: '#330000' } },
  { name: 'After Effects', badge: { text: 'Ae', fg: '#9999FF', bg: '#00005B' } },
]
