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
  {
    key: 'Content-Security-Policy',
    value: [
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      // https: (not a fixed allowlist) is required because press thumbnails are
      // auto-fetched OG/oEmbed images from arbitrary outlet domains (news sites,
      // i.ytimg.com, etc.) — the source list can't be known in advance.
      "img-src 'self' data: https:",
      "font-src 'self'",
      "frame-src https://api.razorpay.com",
      "connect-src 'self' https://i4t9kzxg.api.sanity.io https://api.razorpay.com https://lumberjack.razorpay.com",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        // Apply to every route except Sanity Studio (manages its own CSP)
        source: '/((?!studio).*)',
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
      // Press thumbnails are auto-fetched from arbitrary outlet domains at
      // build time (OG image / YouTube oEmbed) — the hostname can't be
      // known ahead of time, so any https host is allowed for images only.
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
