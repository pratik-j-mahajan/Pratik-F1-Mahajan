import { siFramer, siLottiefiles } from 'simple-icons'

// The tools on the About ticket — only the ones in daily use. `icon` is a simple-icons entry;
// `logo` is the brand's own full-colour mark (in /public/images/tools); a lettered `badge` stands in where no logo is available.
// `ai: true` marks the AI tools, listed in their own row.
export const tools = [
  { name: 'Figma', logo: '/images/tools/figma.svg', brand: '#F24E1E' },
  { name: 'Framer', icon: siFramer },
  { name: 'LottieFiles', icon: siLottiefiles },
  { name: 'Canva', logo: '/images/tools/canva.svg', brand: '#00C4CC' },
  { name: 'Adobe Express', badge: { text: 'Ex', fg: '#ffffff', bg: '#e8304f' } },
  { name: 'Claude', logo: '/images/tools/claude.svg', brand: '#D97757', ai: true },
  { name: 'ChatGPT', logo: '/images/tools/chatgpt.svg', brand: '#10A37F', ai: true },
  { name: 'Perplexity', logo: '/images/tools/perplexity.svg', brand: '#22B8CD', ai: true },
  { name: 'Google Flow', logo: '/images/tools/google-flow.png', brand: '#4285F4', ai: true },
  // TODO: swap for Whisk's real logo once we have the file (Google retired Whisk into Flow, no public asset left)
  { name: 'Google Whisk', badge: { text: 'Wh', fg: '#ffffff', bg: '#4285F4' }, ai: true },
]
