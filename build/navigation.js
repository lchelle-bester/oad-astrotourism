// The site's sections and the pages under them, written once. The footer reads
// this list; the header will move onto it in a later step, so that adding a page
// means adding it here once. Addresses are provisional and match the main nav in
// site/partials/header.html (and studio/schemaTypes/sitePages.js); most of these
// pages do not exist yet and show the 404 page until they are built.
//
// A section with a "pages" list opens a list of pages. "href" is the section's
// own address: its name is a link to it on desktop, and on phones the list
// starts with an overview link to it. These two overview addresses are
// provisional, the sitemap has no landing page for them yet.
module.exports = [
  {
    title: 'Resources',
    href: '/resources/',
    overview: 'Resources overview',
    pages: [
      {title: 'Practical guidelines', href: '/resources/guidelines/'},
      {title: 'Online course', href: '/resources/online-course/'},
      {title: 'Community', href: '/resources/community/'},
    ],
  },
  {
    title: 'Projects and impact',
    href: '/projects/',
    overview: 'Projects and impact overview',
    pages: [
      {title: 'Impact', href: '/projects/impact/'},
      {title: 'Interactive map', href: '/projects/map/'},
      {title: 'Project directory', href: '/projects/directory/'},
      {title: 'Theory of Change', href: '/projects/theory-of-change/'},
      {title: 'Global Survey Report', href: '/projects/survey-report/'},
    ],
  },
  {title: 'Get Funding', href: '/funding/'},
  {title: 'News', href: '/news/'},
]
