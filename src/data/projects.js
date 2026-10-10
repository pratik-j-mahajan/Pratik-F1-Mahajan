/*
  Projects — shown on /projects as the same 3D card stack as the case studies, on red.
  PLACEHOLDER content: replace name, oneLiner, category, year, cover and link for each project.

  `cover`  the project's thumbnail (put it in /public/images/projects/). Leave empty and the card
           shows a clean placeholder with the project's name.
  `link`   where "View project" goes — an external URL (opens in a new tab) or a page here.
           '/coming-soon' shows the "still in the garage" page.
  `accent` the colour of the small tick and button hover on the card.
*/
const projects = [
  {
    slug: 'project-one',
    index: '01',
    name: 'Project One',
    category: 'Web app · UI design',
    oneLiner: 'A short line about what this project is and the problem it solves.',
    year: '2026',
    cover: '',
    accent: '#e10600',
    link: '/coming-soon',
    cta: 'View project',
  },
  {
    slug: 'project-two',
    index: '02',
    name: 'Project Two',
    category: 'Mobile app · Motion',
    oneLiner: 'A short line about what this project is and the problem it solves.',
    year: '2026',
    cover: '',
    accent: '#111214',
    link: '/coming-soon',
    cta: 'View project',
  },
]

export default projects
