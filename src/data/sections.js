// Video played before opening a section. Sections without their own `video` use this.
const DEFAULT_VIDEO = '/videos/case-study.mp4'

// Portfolio sections, each pinned to a spot on the circuit map.
// `pin` is the marker position as a percentage of the map image;
// `align: 'start'` hangs the label to the right of its point (for pins near the left edge on phones).
const sections = [
  {
    id: 'about',
    title: 'About',
    turn: 'Start',
    path: '/about',
    video: '/videos/about.mp4',
    blurb: 'Who I am, how I think and what drives my design.',
    pin: { x: 50.3, y: 68.4 },
  },
  {
    id: 'case-study',
    title: 'Case Study',
    turn: 'Turn 1',
    path: '/case-study',
    blurb: 'Deep dives into problems, process and outcomes.',
    video: '/videos/case-study.mp4',
    pin: { x: 76.5, y: 50.2 },
  },
  {
    id: 'projects',
    title: 'Projects',
    turn: 'DRS',
    path: '/projects',
    blurb: 'Product, visual and front-end work at full speed.',
    pin: { x: 57.5, y: 76.2 },
  },
  {
    id: 'content',
    title: 'Content Posting',
    turn: 'Turn 2',
    path: '/content',
    blurb: 'Posts, carousels and motion pieces I share.',
    pin: { x: 58.7, y: 47.2 },
  },
  {
    id: 'contact',
    title: 'Contact',
    turn: 'Pit lane',
    path: '/contact',
    video: '/videos/contact.mp4',
    blurb: 'Pull into the pits and let’s talk.',
    pin: { x: 31.3, y: 50.2, align: 'start' },
  },
].map((s) => ({ video: DEFAULT_VIDEO, ...s }))

export default sections
