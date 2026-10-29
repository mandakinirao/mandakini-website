import Link from 'next/link'
import { getAdminClient } from '@/lib/admin/sanity'
import { WEBSITE_WORDS } from '@/lib/admin/singletons'
import { DEFAULTS } from '@/lib/site-settings'
import WordsForm from './WordsForm'

export default async function WordsAdmin() {
  const keys = WEBSITE_WORDS.map((w) => w.key).join(', ')
  const doc = await getAdminClient().fetch<Record<string, string> | null>(`*[_id == "siteSettings"][0]{ ${keys} }`)
  const values = Object.fromEntries(WEBSITE_WORDS.map((w) => [w.key, doc?.[w.key] ?? '']))

  return (
    <>
      <Link href="/admin/website" className="mr-admin-back">← Website</Link>
      <div className="mr-admin-head">
        <div>
          <h1>Website words</h1>
          <p className="mr-admin-muted" style={{ margin: '6px 0 0' }}>
            Leave a box empty to keep the wording shown in grey.
          </p>
        </div>
      </div>
      <WordsForm fields={WEBSITE_WORDS} values={values} defaults={DEFAULTS as unknown as Record<string, string>} />
    </>
  )
}
