export const formatINR = (n: number) => `₹${(n ?? 0).toLocaleString('en-IN')}`

export const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
    : ''

export function itemsSummary(items: { title: string; quantity: number }[] = []): string {
  if (!items.length) return ''
  const [first, ...rest] = items
  return `${first.title} × ${first.quantity}${rest.length ? `, +${rest.length} more` : ''}`
}
