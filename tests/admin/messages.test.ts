import { expect, test } from 'vitest'
import { MESSAGE_TABS, setMessageStatus } from '@/lib/admin/messages'
import { makeFakeClient } from './fake-sanity'

test('tabs map to stored statuses', () => {
  expect(MESSAGE_TABS.map((t) => [t.label, t.status])).toEqual([
    ['New', 'new'],
    ['Replied', 'responded'],
    ['Archived', 'closed'],
  ])
})

test('a valid status is saved', async () => {
  const fake = makeFakeClient({})
  expect(await setMessageStatus(fake.client as never, 'enq-1', 'responded')).toEqual({ ok: true })
  expect(fake.patches).toEqual([{ id: 'enq-1', set: { status: 'responded' } }])
})

test('anything else is refused without saving', async () => {
  const fake = makeFakeClient({})
  expect(await setMessageStatus(fake.client as never, 'enq-1', 'deleted' as never)).toEqual({ ok: false })
  expect(fake.patches).toHaveLength(0)
})
