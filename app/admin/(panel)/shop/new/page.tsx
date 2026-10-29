import Link from 'next/link'
import PrintForm, { EMPTY_PRINT } from '@/components/admin/PrintForm'

export default function NewPrintPage() {
  return (
    <>
      <Link href="/admin/shop" className="mr-admin-back">← Shop</Link>
      <div className="mr-admin-head">
        <h1>Add a print</h1>
      </div>
      <PrintForm initial={EMPTY_PRINT} />
    </>
  )
}
