/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/gcp-cost-analysis',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
