/** Corner cat: lines for its speech bubble, and how far it leans toward the cursor. */

export const CAT_LINES = [
  { text: 'Psst… new prints are in the shop', href: '/shop' },
  { text: 'Mandakini wrote something new', href: '/journal' },
  { text: 'Come see the projects', href: '/works' },
  { text: 'Say hello to Mandakini', href: '/contact' },
] as const

export const MAX_LEAN_DEG = 8
const FULL_LEAN_AT_PX = 600

/**
 * Degrees to rotate the cat toward the cursor, from the horizontal distance
 * (cat centre → cursor). Positive tilts right, negative left, capped.
 */
export function leanAngle(catX: number, cursorX: number): number {
  const raw = ((cursorX - catX) / FULL_LEAN_AT_PX) * MAX_LEAN_DEG
  const clamped = Math.max(-MAX_LEAN_DEG, Math.min(MAX_LEAN_DEG, raw))
  return Math.round(clamped * 10) / 10 || 0
}

export function nextLineIndex(current: number): number {
  return (current + 1) % CAT_LINES.length
}
