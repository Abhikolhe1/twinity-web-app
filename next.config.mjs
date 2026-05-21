/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 828, 1080, 1200, 1920],
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    return [
      ...(isProd
        ? [
            {
              source: '/_next/static/(.*)',
              headers: [
                { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
              ],
            },
          ]
        : []),
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',        value: 'nosniff' },
          { key: 'X-Frame-Options',               value: 'DENY' },
          { key: 'X-XSS-Protection',              value: '1; mode=block' },
          { key: 'Referrer-Policy',               value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy',    value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },
}

export default nextConfig
