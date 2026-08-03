// Served under usrsystems.com/case-study/cloud-cost-recommendation via a
// reverse proxy on the GoDaddy-hosted root site — basePath must match
// the proxied path so Next.js emits correctly-prefixed asset/route URLs.
const basePath = '/case-study/cloud-cost-recommendation'

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Apache (via mod_dir) redirects the bare directory path to a
  // trailing-slash URL before our proxy ever sees it. Match that instead
  // of fighting it — Next's default trailingSlash:false redirects trailing
  // slash -> bare path, which loops against Apache's own redirect.
  trailingSlash: true,
}

module.exports = nextConfig
