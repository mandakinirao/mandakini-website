/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Force HTTPS for 2 years
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Only send origin (not full URL) in Referer
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features; allow Razorpay payment APIs
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=(self "https://checkout.razorpay.com")',
    ].join(', '),
  },
  // Content-Security-Policy — prevents XSS (the injection threat relevant
  // to a NoSQL stack). Razorpay needs script-src + frame-src + connect-src.
  // 'unsafe-inline' on script-src is required by Next.js inline hydration.
  // fonts.googleapis.com/fonts.gstatic.com are required because
  // app/globals.css loads EB Garamond + Jost via a plain CSS @import
  // (not next/font) — without these the site-wide body/label/UI fonts
  // silently fall back to system serif/sans.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://*.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // https: (not a fixed allowlist) is required because press thumbnails are
      // auto-fetched OG/oEmbed images from arbitrary outlet domains (news sites,
      // i.ytimg.com, etc.) — the source list can't be known in advance. They
      // load unoptimized (components/press/PressPage.tsx) so this only ever
      // permits a direct browser fetch, never the image-optimizer proxy.
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-src https://*.razorpay.com",
      "connect-src 'self' https://i4t9kzxg.api.sanity.io https://*.razorpay.com",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        // Apply to every route except Sanity Studio (manages its own CSP).
        // Anchored so it only exempts /studio and /studio/*, not e.g. /studio-preview.
        source: '/((?!studio(?:/|$)).*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      // No wildcard host here on purpose — that would make /_next/image an
      // open proxy for optimizing/re-encoding arbitrary URLs at Vercel's
      // expense. Press thumbnails from arbitrary outlet domains load
      // unoptimized instead (components/press/PressPage.tsx).
    ],
  },
}

module.exports = nextConfig
