/** @type {import('next').NextConfig} */
const nextConfig = {
  // SVG/font assets served from /public — no remote images needed for MVP
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
