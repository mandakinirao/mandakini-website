import Link from 'next/link'
import PostEditor, { emptyParagraph } from '@/components/admin/journal/PostEditor'

export default function NewPost() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  return (
    <>
      <Link href="/admin/journal" className="mr-admin-back">← Journal</Link>
      <div className="mr-admin-head"><h1>Write a post</h1></div>
      <PostEditor
        initial={{ title: '', kicker: '', excerpt: '', date: today, featured: false, cover: null, paragraphs: [emptyParagraph()] }}
      />
    </>
  )
}
