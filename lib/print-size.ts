export type SizeUnit = 'cm' | 'in'

/** "40 × 30 cm" (height × width), or '' when either side is missing. */
export function formatPrintSize(
  height: number | null | undefined,
  width: number | null | undefined,
  unit: SizeUnit | string | null | undefined
): string {
  if (!height || !width) return ''
  return `${height} × ${width} ${unit === 'in' ? 'in' : 'cm'}`
}
