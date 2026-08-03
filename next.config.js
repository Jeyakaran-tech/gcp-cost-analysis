/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served under usrsystems.com/case-study/cloud-cost-recommendation via a
  // reverse proxy on the GoDaddy-hosted root site — basePath must match
  // the proxied path so Next.js emits correctly-prefixed asset URLs.
  basePath: '/case-study/cloud-cost-recommendation',
}

module.exports = nextConfig
