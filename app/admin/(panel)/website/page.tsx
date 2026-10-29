import Link from 'next/link'

const AREAS = [
  { href: '/admin/website/homepage', title: 'Homepage', text: 'The two opening pictures, and the order of what shows on the homepage.' },
  { href: '/admin/website/about', title: 'About', text: 'Your portrait, the About text and the short homepage introduction.' },
  { href: '/admin/website/testimonials', title: 'Testimonials', text: 'Kind words from students and collectors.' },
  { href: '/admin/website/words', title: 'Website words', text: 'Headlines and short messages around the site.' },
]

export default function WebsitePage() {
  return (
    <>
      <div className="mr-admin-head">
        <h1>Website</h1>
      </div>
      <div className="mr-admin-grid">
        {AREAS.map((a) => (
          <Link key={a.href} href={a.href} className="mr-admin-card">
            <div className="mr-admin-card__body" style={{ padding: 24 }}>
              <h2>{a.title}</h2>
              <span className="mr-admin-muted">{a.text}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
