import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IMAGE_PROJECTION, toPhoto } from '@/lib/admin/photos'
import { getAdminClient } from '@/lib/admin/sanity'
import TestimonialForm from '../TestimonialForm'

export default async function EditTestimonial({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id)
  const t = await getAdminClient().fetch<{ _id: string; quote?: string; personName?: string; photo?: { assetId?: string; url?: string; alt?: string } } | null>(
    `*[_type == "testimonial" && _id == $id][0]{ _id, quote, personName, "photo": personImage${IMAGE_PROJECTION} }`,
    { id }
  )
  if (!t) notFound()
  return (
    <>
      <Link href="/admin/website/testimonials" className="mr-admin-back">← Testimonials</Link>
      <div className="mr-admin-head"><h1>{t.personName || 'Testimonial'}</h1></div>
      <TestimonialForm id={t._id} initial={{ quote: t.quote ?? '', personName: t.personName ?? '', photo: toPhoto(t.photo, t.personName) }} />
    </>
  )
}
