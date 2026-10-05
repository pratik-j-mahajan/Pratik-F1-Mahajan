import { siFramer, siLottiefiles } from 'simple-icons'

// The tools on the About ticket — only the ones in daily use. `icon` is a simple-icons entry;
// `logo` is the brand's own full-colour mark (in /public/images/tools); Adobe apps use a lettered `badge`.
export const tools = [
  { name: 'Figma', logo: '/images/tools/figma.svg', brand: '#F24E1E' },
  { name: 'Framer', icon: siFramer },
  { name: 'LottieFiles', icon: siLottiefiles },
  { name: 'Canva', logo: '/images/tools/canva.svg', brand: '#00C4CC' },
  { name: 'Illustrator', badge: { text: 'Ai', fg: '#FF9A00', bg: '#330000' } },
]
