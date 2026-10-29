import Link from 'next/link'
import PressForm from '@/components/admin/PressForm'

export default function NewPress() {
  return (
    <>
      <Link href="/admin/press" className="mr-admin-back">← Press</Link>
      <div className="mr-admin-head"><h1>Add press</h1></div>
      <PressForm initial={{ link: '', type: 'article', headline: '', source: '', thumbnail: null, logoCard: false, showOnHomepage: false }} />
    </>
  )
}
