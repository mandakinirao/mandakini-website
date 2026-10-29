import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin/auth'
import { getAdminClient } from '@/lib/admin/sanity'
import { validateUpload } from '@/lib/admin/upload'

/** One photo per request (multipart field "file") → Sanity image asset. */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  let file: File | null = null
  try {
    const form = await req.formData()
    const f = form.get('file')
    file = f instanceof File ? f : null
  } catch {
    file = null
  }
  if (!file) return NextResponse.json({ error: 'No photo was received.' }, { status: 400 })

  const check = validateUpload({ type: file.type, size: file.size, name: file.name })
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 })

  try {
    const asset = await getAdminClient().assets.upload('image', Buffer.from(await file.arrayBuffer()), {
      filename: file.name,
    })
    return NextResponse.json({ assetId: asset._id, url: asset.url })
  } catch (err) {
    console.error('[admin-upload] Sanity upload failed:', err)
    return NextResponse.json({ error: `${file.name} couldn't be uploaded. Try again.` }, { status: 502 })
  }
}
