// Served under usrsystems.com/case-study/cloud-cost-recommendation via a
// reverse proxy on the GoDaddy-hosted root site — basePath must match
// the proxied path so Next.js emits correctly-prefixed asset/route URLs.
const basePath = '/case-study/cloud-cost-recommendation'

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

module.exports = nextConfig
