import type { Metadata } from 'next'
import ContactForm from '@/components/contact/ContactForm'
import PageWash from '@/components/ui/PageWash'
import { getSiteSettings } from '@/lib/site-settings'
import '@/styles/pages.css'

export const metadata: Metadata = {
  title: 'Contact — Mandakini Rao',
  description: 'Get in touch with Mandakini Rao about commissions, workshops, and original works.',
}

export const revalidate = 60

export default async function ContactPage() {
  const { contactPageIntro, contactEmail } = await getSiteSettings()

  return (
    <>
    <PageWash className="contact-sand page-wash-light" />
    <section className="mr2-contact-page mr2-page-shell">
      <div className="mr2-contact__layout">
        <div className="mr2-contact__intro">
          <h1 className="mr2-contact__heading">Get in touch</h1>
          {contactPageIntro && <p className="mr2-contact__text">{contactPageIntro}</p>}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="mr2-contact__email">
              {contactEmail}
            </a>
          )}
        </div>
        <ContactForm />
      </div>
    </section>
    </>
  )
}
