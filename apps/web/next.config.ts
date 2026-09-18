// NOTE: Next only reads .env files from the app dir; this loads the monorepo root ones before
// compile so server code and inlined NEXT_PUBLIC_* vars see them.
import '@midnightmunches/env/load';
import path from 'node:path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@midnightmunches/ui', '@midnightmunches/types', '@midnightmunches/env'],
  output: 'standalone',
  // NOTE: trace from the monorepo root so workspace packages land in the standalone bundle.
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
