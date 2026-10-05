// Video played before opening a section. Sections without their own `video` use this.
const DEFAULT_VIDEO = '/videos/case-study.mp4'

// Portfolio sections, each pinned to a spot on the circuit map.
// `pin` is the marker position as a percentage of the map image;
// `align` hangs the label beside its point on phones: 'start' = to the right (pins near the left
// edge), 'end' = to the left (pins near the right edge).
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
    video: '/videos/projects.mp4',
    blurb: 'Product, visual and front-end work at full speed.',
    pin: { x: 27.3, y: 55.5, align: 'start' }, // on the main straight (DRS zone)
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
    pin: { x: 61, y: 72.3 }, // just inside the track, on the service road
  },
].map((s) => ({ video: DEFAULT_VIDEO, ...s }))

export default sections
