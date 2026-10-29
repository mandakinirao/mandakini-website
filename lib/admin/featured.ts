/** Homepage selection: items switched to "Show on homepage", else the first few. */
export function pickFeatured<T>(featured: T[] | null, fallback: T[] | null, cap: number): T[] {
  const list = featured?.length ? featured : fallback ?? []
  return list.slice(0, cap)
}
