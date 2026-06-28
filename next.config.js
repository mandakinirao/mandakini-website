/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Force HTTPS for 2 years; prevents downgrade attacks
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block clickjacking — this site is never embedded in an iframe
  { key: 'X-Frame-Options', value: 'DENY' },
  // Only send origin (not full URL) in Referer to third parties
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features; allow Stripe payment APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")',
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        // Apply to every route except Sanity Studio (it manages its own headers)
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
    ],
  },
}

module.exports = nextConfig
