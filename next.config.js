/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  // output: 'export' disables API routes — only use for GitHub Pages builds
  ...(isDev ? {} : { output: 'export' }),
  basePath: '/gcp-cost-analysis',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
