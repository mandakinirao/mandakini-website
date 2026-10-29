import Link from 'next/link'
import TestimonialForm from '../TestimonialForm'

export default function NewTestimonial() {
  return (
    <>
      <Link href="/admin/website/testimonials" className="mr-admin-back">← Testimonials</Link>
      <div className="mr-admin-head"><h1>Add a testimonial</h1></div>
      <TestimonialForm initial={{ quote: '', personName: '', photo: null }} />
    </>
  )
}
