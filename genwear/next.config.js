/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  // Enable React strict mode
  reactStrictMode: true,
  // Enable static optimization
  swcMinify: true,
}

module.exports = nextConfig
