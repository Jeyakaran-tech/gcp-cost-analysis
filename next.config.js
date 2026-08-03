// Served under usrsystems.com/case-study/cloud-cost-recommendation via a
// reverse proxy on the GoDaddy-hosted root site — basePath must match
// the proxied path so Next.js emits correctly-prefixed page/route URLs.
const basePath = '/case-study/cloud-cost-recommendation'
const vercelOrigin = 'https://gcp-cost-monitor.vercel.app'

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  // GoDaddy's PHP reverse proxy can only handle a few concurrent requests
  // before hitting the shared-hosting process limit — send _next/static
  // (JS/CSS/fonts) straight to Vercel's origin instead of through it, since
  // Vercel already serves those with CORS wildcard enabled.
  assetPrefix: vercelOrigin + basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Apache (via mod_dir) redirects the bare directory path to a
  // trailing-slash URL before our proxy ever sees it. Match that instead
  // of fighting it — Next's default trailingSlash:false redirects trailing
  // slash -> bare path, which loops against Apache's own redirect.
  trailingSlash: true,
}

module.exports = nextConfig
