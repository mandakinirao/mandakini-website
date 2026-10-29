import type { SanityClient } from 'next-sanity'
import { imageField } from '@/lib/admin/content'
import type { PrintImage } from '@/lib/admin/shop'
import type { SiteSettings } from '@/lib/site-settings'

type Client = Pick<SanityClient, 'createIfNotExists' | 'patch' | 'fetch'>

export interface WordField {
  key: keyof SiteSettings
  group: string
  label: string
  hint: string
  long?: boolean
}

export const WEBSITE_WORDS: WordField[] = [
  { key: 'shopPageHeadline', group: 'Shop', label: 'Shop page headline', hint: 'The big line at the top of the Shop page.' },
  { key: 'shopPrintNote', group: 'Shop', label: 'Note under every print', hint: 'Shown on each print’s page.', long: true },
  { key: 'printDefaultPaper', group: 'Shop', label: 'Paper', hint: 'Shown in each print’s details.' },
  { key: 'printDefaultSignature', group: 'Shop', label: 'Signature', hint: 'Shown in each print’s details.' },
  { key: 'printDefaultShipping', group: 'Shop', label: 'Shipping', hint: 'Shown in each print’s details.' },
  { key: 'worksPageHeadline', group: 'Projects', label: 'Projects page headline', hint: 'The big line at the top of the Projects page.' },
  { key: 'worksEmptyHeadline', group: 'Projects', label: 'Headline when there are no projects', hint: 'Only shown if no projects are published.' },
  { key: 'worksEmptyBody', group: 'Projects', label: 'Text when there are no projects', hint: 'Only shown if no projects are published.', long: true },
  { key: 'contactPageIntro', group: 'Contact', label: 'Contact page introduction', hint: 'Above the contact form.', long: true },
  { key: 'contactEmail', group: 'Contact', label: 'Email shown on the Contact page', hint: 'Visitors can write to this address.' },
  { key: 'thankYouMessage', group: 'After an order', label: 'Message after someone buys', hint: 'Shown on the thank-you page after payment.', long: true },
  { key: 'privateCollectionTitle', group: 'Private collection', label: 'Private collection title', hint: 'Heading for enquiry-only works.' },
  { key: 'privateCollectionLine', group: 'Private collection', label: 'Private collection line', hint: 'One line under that heading.', long: true },
]

export const SITE_SETTINGS_ID = 'siteSettings'

async function patchWithBlanks(client: Client, id: string, fields: Record<string, unknown>) {
  const set: Record<string, unknown> = {}
  const unset: string[] = []
  for (const [k, v] of Object.entries(fields)) {
    if (v === null || v === '') unset.push(k)
    else set[k] = v
  }
  let p = client.patch(id).set(set)
  if (unset.length) p = p.unset(unset)
  await p.commit()
}

/** Blank = use the site's built-in wording (field removed). */
export async function saveWebsiteWords(client: Client, raw: Record<string, unknown>): Promise<void> {
  const fields: Record<string, unknown> = {}
  for (const w of WEBSITE_WORDS) fields[w.key] = String(raw[w.key] ?? '').trim().slice(0, 1000)
  await client.createIfNotExists({ _id: SITE_SETTINGS_ID, _type: 'siteSettings' })
  await patchWithBlanks(client, SITE_SETTINGS_ID, fields)
}

export interface AboutInput {
  portrait: PrintImage | null
  bio: string
  homeSnippet: string
  teaserLine: string
}

/** Writes the aboutPage record the public site reads (not the unused Studio "about"). */
export async function saveAbout(client: Client, input: AboutInput): Promise<void> {
  let id = await client.fetch<string | null>(`*[_type == "aboutPage"][0]._id`)
  if (!id) {
    id = 'aboutPage'
    await client.createIfNotExists({ _id: id, _type: 'aboutPage' })
  }
  await patchWithBlanks(client, id, {
    aboutBlockPortrait: imageField(input.portrait, 'Mandakini Rao'),
    aboutBlockBio: input.bio.trim().slice(0, 5000),
    homeSnippet: input.homeSnippet.trim().slice(0, 1000),
    aboutTeaserLine: input.teaserLine.trim().slice(0, 300),
  })
}
