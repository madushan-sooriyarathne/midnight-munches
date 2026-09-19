// NOTE: Next only reads .env files from the app dir; this loads the monorepo root ones before
// compile so server code and inlined NEXT_PUBLIC_* vars see them.
import '@midnightmunches/env/load';
import path from 'node:path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@midnightmunches/ui',
    '@midnightmunches/types',
    '@midnightmunches/env',
    '@midnightmunches/auth',
  ],
  output: 'standalone',
  // NOTE: trace from the monorepo root so workspace packages land in the standalone bundle.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    // NOTE: stall covers are served from the R2 public domain; must be set at `next build`.
    remotePatterns: process.env.R2_PUBLIC_DOMAIN
      ? [new URL(`${process.env.R2_PUBLIC_DOMAIN}/**`)]
      : [],
  },
};

export default nextConfig;
