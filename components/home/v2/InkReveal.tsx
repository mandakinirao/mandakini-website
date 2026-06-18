'use client'

import { useEffect, useRef } from 'react'
import { isTouch } from '@/lib/motion'

// ── Tunable ──────────────────────────────────────────────────────────────
const BRUSH_R         = 130   // base brush radius px
const BRUSH_VARY      = 50    // ± random size variation
const WOBBLE          = 20    // position jitter per stamp
const STAMP_SPACING   = 6     // px between stamps along cursor trail
const HEAL_PER_SEC    = 0.75  // fraction of erase healed per second
const HARD_CLEAR_MS   = 2800  // ms of no new strokes → force eraseCanvas to zero
// ─────────────────────────────────────────────────────────────────────────

/** Canvas equivalent of object-fit: cover; object-position: center */
function coverRect(
  iw: number, ih: number,
  cw: number, ch: number,
): [number, number, number, number] {
  const scale = Math.max(cw / iw, ch / ih)
  const sw = iw * scale, sh = ih * scale
  return [(cw - sw) / 2, (ch - sh) / 2, sw, sh]
}

export default function InkReveal({
  topSrc,
  bottomSrc,
}: {
  topSrc: string
  bottomSrc: string
}) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap   = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /**
     * Architecture — everything is drawn ON the canvas so it is always
     * 100% opaque. No CSS image behind it, no bleed-through possible.
     *
     *  eraseCanvas  — the hole map: opaque where top image is erased.
     *                 Starts empty; stamps add opacity; heal reduces it.
     *  topCanvas    — scratch buffer: top image with holes cut by eraseCanvas.
     *  main canvas  — bottom image (opaque base) + topCanvas composited over.
     *
     * Because the main canvas always starts with the bottom image (opaque),
     * there is zero CSS layer behind it and no path for residual alpha to
     * create visible bleed.
     */
    const eraseCanvas = document.createElement('canvas')
    const ec          = eraseCanvas.getContext('2d')!

    const topCanvas   = document.createElement('canvas')
    const tc          = topCanvas.getContext('2d')!

    let w = 0, h = 0
    let prevX = -1, prevY = -1
    let lastTime = 0
    let animId   = 0
    let topImg:    HTMLImageElement | null = null
    let bottomImg: HTMLImageElement | null = null
    // Tracks theoretical peak alpha so we know when heal can skip.
    let eraseMaxAlpha = 0
    // Timestamp (performance.now) of the most recent stamp — used for the
    // hard-clear timeout that guarantees eraseCanvas reaches exactly zero.
    let lastStampAt = -Infinity

    function resize() {
      const r = wrap!.getBoundingClientRect()
      w = r.width; h = r.height
      canvas!.width     = eraseCanvas.width  = topCanvas.width  = w
      canvas!.height    = eraseCanvas.height = topCanvas.height = h
      eraseMaxAlpha = 0
      if (topImg && bottomImg) renderFrame(0)
    }

    // Paint one soft ellipse stamp onto the erase mask
    function stamp(x: number, y: number) {
      const r  = BRUSH_R + (Math.random() - 0.5) * BRUSH_VARY
      const rx = r * (0.75 + Math.random() * 0.5)
      const ry = r * (0.55 + Math.random() * 0.5)
      const wx = x + (Math.random() - 0.5) * WOBBLE
      const wy = y + (Math.random() - 0.5) * WOBBLE
      const rot = Math.random() * Math.PI

      const maxR = Math.max(rx, ry)
      const grad = ec.createRadialGradient(wx, wy, 0, wx, wy, maxR)
      grad.addColorStop(0,    'rgba(0,0,0,0.96)')
      grad.addColorStop(0.38, 'rgba(0,0,0,0.78)')
      grad.addColorStop(0.72, 'rgba(0,0,0,0.18)')
      grad.addColorStop(1,    'rgba(0,0,0,0)')

      ec.save()
      ec.globalCompositeOperation = 'source-over'
      ec.fillStyle = grad
      ec.beginPath()
      ec.ellipse(wx, wy, rx, ry, rot, 0, Math.PI * 2)
      ec.fill()
      ec.restore()
      eraseMaxAlpha = Math.max(eraseMaxAlpha, 0.96)
      lastStampAt   = performance.now()
    }

    // Interpolate stamps along cursor path
    function addStamps(cx: number, cy: number) {
      if (prevX < 0) { prevX = cx; prevY = cy }
      const dx    = cx - prevX
      const dy    = cy - prevY
      const dist  = Math.hypot(dx, dy)
      const count = Math.max(1, Math.round(dist / STAMP_SPACING))
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 1 : i / (count - 1)
        stamp(prevX + dx * t, prevY + dy * t)
      }
      prevX = cx; prevY = cy
    }

    function renderFrame(now: number) {
      if (!topImg || !bottomImg || !ctx || w === 0) return

      // 1. Heal eraseCanvas
      if (eraseMaxAlpha > 0) {
        // Hard clear: once no new stroke has arrived for HARD_CLEAR_MS, force
        // eraseCanvas to exactly transparent. Exponential decay never reaches 0;
        // this guarantees the top image fully returns after every brush pass.
        if (performance.now() - lastStampAt >= HARD_CLEAR_MS) {
          ec.clearRect(0, 0, w, h)
          eraseMaxAlpha = 0
        } else if (now > 0 && lastTime > 0) {
          // Smooth exponential fade while strokes are recent
          const dt       = Math.min((now - lastTime) / 1000, 0.1)
          const healRate = 1 - Math.pow(1 - HEAL_PER_SEC, dt)
          eraseMaxAlpha *= (1 - healRate)
          ec.save()
          ec.globalCompositeOperation = 'destination-out'
          ec.globalAlpha  = healRate
          ec.fillStyle    = '#000'
          ec.fillRect(0, 0, w, h)
          ec.restore()
        }
      }

      // 2. Build masked top image on scratch canvas
      //    a) draw top image fully
      tc.clearRect(0, 0, w, h)
      tc.globalCompositeOperation = 'source-over'
      tc.drawImage(topImg, ...coverRect(topImg.naturalWidth, topImg.naturalHeight, w, h))
      //    b) punch holes where erase mask is opaque
      tc.globalCompositeOperation = 'destination-out'
      tc.drawImage(eraseCanvas, 0, 0)
      tc.globalCompositeOperation = 'source-over'

      // 3. Composite onto main canvas — bottom image is the always-opaque base
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(bottomImg, ...coverRect(bottomImg.naturalWidth, bottomImg.naturalHeight, w, h))
      // Composite the masked top image over the bottom
      ctx.drawImage(topCanvas, 0, 0)

      lastTime = now
    }

    function loop(now: number) {
      renderFrame(now)
      animId = requestAnimationFrame(loop)
    }

    function onMouseMove(e: MouseEvent) {
      const r = canvas!.getBoundingClientRect()
      addStamps(e.clientX - r.left, e.clientY - r.top)
    }

    function onMouseLeave() {
      prevX = -1; prevY = -1
    }

    // Load both images, start once both are ready
    let loaded = 0
    function onLoad() {
      loaded++
      if (loaded < 2) return
      resize()
      if (isTouch()) return
      animId = requestAnimationFrame(loop)
      wrap!.addEventListener('mousemove',  onMouseMove)
      wrap!.addEventListener('mouseleave', onMouseLeave)
    }

    const top    = new Image(); top.onload    = onLoad; top.src    = topSrc
    const bottom = new Image(); bottom.onload = onLoad; bottom.src = bottomSrc
    topImg    = top
    bottomImg = bottom

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    return () => {
      cancelAnimationFrame(animId)
      wrap?.removeEventListener('mousemove',  onMouseMove)
      wrap?.removeEventListener('mouseleave', onMouseLeave)
      ro.disconnect()
    }
  }, [topSrc, bottomSrc])

  return (
    // No CSS image behind the canvas — both layers are drawn on-canvas.
    // The canvas is always 100% opaque: no bleed-through path exists.
    <div ref={wrapRef} className="mr2-ink" aria-hidden="true">
      <canvas ref={canvasRef} className="mr2-ink__canvas" />
    </div>
  )
}
