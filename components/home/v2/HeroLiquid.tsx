'use client'

/**
 * WebGL liquid-reveal hero effect.
 *
 * u_base  — the colored portrait, always visible at rest.
 * u_alt   — alternate treatment revealed under the cursor.
 * u_disp  — smooth displacement map (procedural fallback generated here;
 *            real image loaded if dispSrc is provided and resolves).
 *
 * Effect: a soft radial region around the cursor fades in u_alt with a
 * fluid UV warp driven by the displacement map. Warp amplitude scales with
 * cursor velocity and settles as the cursor stills. Canvas starts at
 * opacity 0; fades in via CSS once both textures are decoded.
 *
 * Render loop piggy-backs on the GSAP ticker — no competing rAF.
 * Respects prefers-reduced-motion: if set, returns null immediately.
 */

import { useEffect, useRef } from 'react'
import { mandaGsap, prefersReducedMotion } from '@/lib/motion'

// ── Tunable effect parameters ──────────────────────────────────────────
// Edit these constants; corresponding uniforms are updated on each frame.

/** Reveal circle radius — fraction of the canvas shorter dimension [0..1]. */
const REVEAL_RADIUS  = 0.26

/** Edge feather softness: 0 = hard circle, 1 = very soft painterly fade. */
const EDGE_FEATHER   = 0.58

/** Base displacement amplitude in UV space. Keep ≤ 0.05 for smooth feel. */
const DISP_AMPLITUDE = 0.028

/** Extra amplitude added at peak cursor velocity [0..1]. */
const VELOCITY_INFL  = 0.038

/** Per-frame decay rate for cursor velocity (higher = settles faster). */
const SETTLE_SPEED   = 0.07

/** Lerp rate for reveal fading in when cursor enters the hero. */
const REVEAL_LERP_IN  = 0.10

/** Lerp rate for reveal fading out when cursor leaves the hero. */
const REVEAL_LERP_OUT = 0.055
// ──────────────────────────────────────────────────────────────────────

/* ── GLSL shaders ───────────────────────────────────────────────────── */

const VERT = /* glsl */ `
attribute vec2 a_pos;
varying   vec2 v_uv;
void main() {
  v_uv        = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_base;
uniform sampler2D u_alt;
uniform sampler2D u_disp;

uniform vec2  u_cursor;     // [0..1] normalised cursor (WebGL y: 0=bottom)
uniform float u_reveal;     // [0..1] lerped overall reveal
uniform float u_velocity;   // [0..1] normalised cursor speed
uniform vec2  u_res;        // canvas px (updated on resize)
uniform vec2  u_base_size;  // base image px (for cover-fit)
uniform vec2  u_alt_size;   // alt  image px (for cover-fit)

// Mirrors of the JS constants — passed as uniforms so tweaks above
// take effect without recompiling the shader.
uniform float u_radius;
uniform float u_feather;
uniform float u_disp_amp;
uniform float u_vel_infl;

// Cover-fit: maps a canvas [0..1] UV onto the image's [0..1] UV space,
// centred and cropped to fill. Values outside [0..1] clamp to edge pixels.
vec2 coverUV(vec2 uv, vec2 res, vec2 img) {
  float rA = res.x / res.y;
  float iA = img.x / img.y;
  vec2 s   = (rA > iA) ? vec2(1.0, iA / rA) : vec2(rA / iA, 1.0);
  return (uv - 0.5) / s + 0.5;
}

void main() {
  float aspect = u_res.x / u_res.y;

  vec2 baseUV = coverUV(v_uv, u_res, u_base_size);
  vec2 altUV  = coverUV(v_uv, u_res, u_alt_size);

  // Aspect-corrected distance keeps the reveal circle on any viewport.
  vec2  d2  = v_uv - u_cursor;
  d2.x     *= aspect;
  float dist = length(d2);

  // Soft feathered radial mask: 1 at cursor, 0 at/beyond radius.
  float inner = u_radius * (1.0 - u_feather);
  float mask  = (1.0 - smoothstep(inner, u_radius, dist)) * u_reveal;

  // Displacement: sample smooth map at raw canvas UV (wraps for large fields).
  vec4  dp  = texture2D(u_disp, v_uv);
  float amp = u_disp_amp + u_velocity * u_vel_infl;
  vec2  warp = (dp.rg - 0.5) * 2.0 * amp * mask;

  vec4 base = texture2D(u_base, baseUV);
  vec4 alt  = texture2D(u_alt,  altUV + warp);

  gl_FragColor = mix(base, alt, mask);
}
`

/* ── GL utilities ───────────────────────────────────────────────────── */

function makeShader(gl: WebGLRenderingContext, type: GLenum, src: string): WebGLShader {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src.trim())
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? 'shader error')
  return s
}

function makeProgram(gl: WebGLRenderingContext): WebGLProgram {
  const p = gl.createProgram()!
  gl.attachShader(p, makeShader(gl, gl.VERTEX_SHADER,   VERT))
  gl.attachShader(p, makeShader(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p) ?? 'link error')
  return p
}

function uploadTex(
  gl: WebGLRenderingContext,
  source: HTMLImageElement | HTMLCanvasElement,
  wrapMode: number,
): WebGLTexture {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  return tex
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => res(img)
    img.onerror = rej
    img.src     = src
  })
}

/**
 * Procedural displacement canvas: smooth layered sine/cosine waves.
 * No noise, no grain — purely fluid. Replaced if a real dispSrc loads.
 */
function makeProceduralDisp(size = 512): HTMLCanvasElement {
  const c   = document.createElement('canvas')
  c.width   = c.height = size
  const ctx = c.getContext('2d')!
  const id  = ctx.createImageData(size, size)
  const px  = id.data
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size
      const ny = y / size
      const r  =  0.5
        + 0.22 * Math.sin(nx * Math.PI * 2.8 + ny * Math.PI * 1.5)
        + 0.14 * Math.sin(nx * Math.PI * 5.2 - ny * Math.PI * 3.1)
        + 0.08 * Math.cos(nx * Math.PI * 7.6 + ny * Math.PI * 4.9)
      const g  =  0.5
        + 0.22 * Math.cos(nx * Math.PI * 2.1 + ny * Math.PI * 3.4)
        + 0.14 * Math.cos(nx * Math.PI * 4.7 - ny * Math.PI * 2.3)
        + 0.08 * Math.sin(nx * Math.PI * 6.8 + ny * Math.PI * 5.2)
      const i  = (y * size + x) * 4
      px[i]   = Math.round(Math.min(1, Math.max(0, r)) * 255)
      px[i+1] = Math.round(Math.min(1, Math.max(0, g)) * 255)
      px[i+2] = 128
      px[i+3] = 255
    }
  }
  ctx.putImageData(id, 0, 0)
  return c
}

/* ── Component ──────────────────────────────────────────────────────── */

export interface HeroLiquidProps {
  src:      string
  altSrc:   string
  dispSrc?: string
  onReady?: () => void
}

export default function HeroLiquid({ src, altSrc, dispSrc, onReady }: HeroLiquidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const cv = canvasRef.current
    if (!cv) return

    const glCtx = cv.getContext('webgl', {
      alpha:                 false,
      antialias:             false,
      powerPreference:       'low-power',
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null
    if (!glCtx) return // no WebGL — static fallback below stays visible

    // Narrow to non-null for use in closures below.
    const gl = glCtx

    let prog: WebGLProgram
    try {
      prog = makeProgram(gl)
    } catch {
      return // shader compile failed — static fallback remains
    }

    // Full-screen quad (TRIANGLE_STRIP)
    const buf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1,  1, -1,  -1, 1,  1, 1]),
      gl.STATIC_DRAW,
    )

    gl.useProgram(prog)

    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    // Uniform locations
    const uBase     = gl.getUniformLocation(prog, 'u_base')
    const uAlt      = gl.getUniformLocation(prog, 'u_alt')
    const uDisp     = gl.getUniformLocation(prog, 'u_disp')
    const uCursor   = gl.getUniformLocation(prog, 'u_cursor')
    const uReveal   = gl.getUniformLocation(prog, 'u_reveal')
    const uVelocity = gl.getUniformLocation(prog, 'u_velocity')
    const uRes      = gl.getUniformLocation(prog, 'u_res')
    const uBaseSize = gl.getUniformLocation(prog, 'u_base_size')
    const uAltSize  = gl.getUniformLocation(prog, 'u_alt_size')
    const uRadius   = gl.getUniformLocation(prog, 'u_radius')
    const uFeather  = gl.getUniformLocation(prog, 'u_feather')
    const uDispAmp  = gl.getUniformLocation(prog, 'u_disp_amp')
    const uVelInfl  = gl.getUniformLocation(prog, 'u_vel_infl')

    gl.uniform1i(uBase, 0)
    gl.uniform1i(uAlt,  1)
    gl.uniform1i(uDisp, 2)

    // Pass tunable JS constants to shader
    gl.uniform1f(uRadius,  REVEAL_RADIUS)
    gl.uniform1f(uFeather, EDGE_FEATHER)
    gl.uniform1f(uDispAmp, DISP_AMPLITUDE)
    gl.uniform1f(uVelInfl, VELOCITY_INFL)

    // ── Runtime state ──────────────────────────────────────
    let baseTex:   WebGLTexture | null = null
    let altTex:    WebGLTexture | null = null
    let dispTex:   WebGLTexture | null = null
    let ready     = false
    let destroyed = false

    let cursorX = -2   // starts off-screen
    let cursorY = -2
    let lastCX  = 0
    let lastCY  = 0

    let revealCurrent = 0
    let revealTarget  = 0
    let velCurrent    = 0
    let velTarget     = 0

    // ── Resize handler ──────────────────────────────────
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      // cv is guaranteed non-null here; guard is above the closure.
      const w   = Math.round(cv!.clientWidth  * dpr)
      const h   = Math.round(cv!.clientHeight * dpr)
      if (cv!.width === w && cv!.height === h) return
      cv!.width  = w
      cv!.height = h
      gl.viewport(0, 0, w, h)
      gl.useProgram(prog)
      gl.uniform2f(uRes, w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)

    // ── Cursor tracking ─────────────────────────────────
    function onMove(e: MouseEvent) {
      const rect = cv!.getBoundingClientRect()
      const inHero = (
        e.clientX >= rect.left   &&
        e.clientX <= rect.right  &&
        e.clientY >= rect.top    &&
        e.clientY <= rect.bottom
      )
      if (!inHero) {
        revealTarget = 0
        return
      }
      revealTarget = 1
      const nx  = (e.clientX - rect.left) / rect.width
      const ny  = 1 - (e.clientY - rect.top) / rect.height // flip Y for GL
      const dx  = nx - lastCX
      const dy  = ny - lastCY
      velTarget = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 90)
      cursorX   = nx
      cursorY   = ny
      lastCX    = nx
      lastCY    = ny
    }
    function onLeave() { revealTarget = 0 }

    window.addEventListener('mousemove',  onMove,  { passive: true })
    window.addEventListener('mouseleave', onLeave, { passive: true })

    // ── Texture loading ──────────────────────────────────
    // Procedural displacement is ready immediately; real map replaces it if dispSrc resolves.
    dispTex = uploadTex(gl, makeProceduralDisp(), gl.REPEAT)

    Promise.all([loadImg(src), loadImg(altSrc)])
      .then(([bi, ai]) => {
        if (destroyed) return
        baseTex = uploadTex(gl, bi, gl.CLAMP_TO_EDGE)
        altTex  = uploadTex(gl, ai, gl.CLAMP_TO_EDGE)
        gl.useProgram(prog)
        gl.uniform2f(uBaseSize, bi.naturalWidth, bi.naturalHeight)
        gl.uniform2f(uAltSize,  ai.naturalWidth, ai.naturalHeight)
        ready = true
        cv!.dataset.ready = 'true' // triggers CSS opacity transition in v2.css
        onReady?.()
      })
      .catch(() => { /* portrait load failed — static fallback stays visible */ })

    // Optional real displacement map (non-critical; procedural used if this fails)
    if (dispSrc) {
      loadImg(dispSrc)
        .then(di => {
          if (destroyed) return
          const next = uploadTex(gl, di, gl.REPEAT)
          if (dispTex) gl.deleteTexture(dispTex)
          dispTex = next
        })
        .catch(() => { /* keep procedural displacement */ })
    }

    // ── Render tick — GSAP ticker drives this, no separate rAF ──
    function tick() {
      if (!ready || !baseTex || !altTex || !dispTex) return

      // Lerp reveal envelope (different rates for enter / leave)
      const lr = revealTarget > revealCurrent ? REVEAL_LERP_IN : REVEAL_LERP_OUT
      revealCurrent += (revealTarget - revealCurrent) * lr

      // Lerp and naturally decay cursor velocity (gives the "settle" feel)
      velCurrent += (velTarget  - velCurrent) * 0.14
      velTarget  *= (1 - SETTLE_SPEED)

      gl.useProgram(prog)
      gl.uniform2f(uCursor,   cursorX,       cursorY)
      gl.uniform1f(uReveal,   revealCurrent)
      gl.uniform1f(uVelocity, velCurrent)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, baseTex)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, altTex)
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, dispTex)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    mandaGsap.ticker.add(tick)

    // ── Cleanup on unmount / route change ────────────────
    return () => {
      destroyed = true
      mandaGsap.ticker.remove(tick)
      ro.disconnect()
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseleave', onLeave)
      if (baseTex) gl.deleteTexture(baseTex)
      if (altTex)  gl.deleteTexture(altTex)
      if (dispTex) gl.deleteTexture(dispTex)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [src, altSrc, dispSrc, onReady])

  return (
    <canvas
      ref={canvasRef}
      className="mr2-hp__gl"
      aria-hidden="true"
    />
  )
}
