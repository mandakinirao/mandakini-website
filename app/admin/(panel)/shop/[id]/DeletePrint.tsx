'use client'

import { useRouter } from 'next/navigation'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { deletePrint } from '../actions'

export default function DeletePrint({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  return (
    <ConfirmButton
      label="Delete this print"
      question={`Delete ${title} from the website? This can't be undone.`}
      confirmLabel="Yes, delete it"
      keepLabel="Keep it"
      onConfirm={async () => {
        const r = await deletePrint(id)
        if (!r.ok) return r.error
        router.replace('/admin/shop')
      }}
    />
  )
}
