import path from 'node:path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@midnightmunches/ui', '@midnightmunches/types'],
  output: 'standalone',
  // NOTE: trace from the monorepo root so workspace packages land in the standalone bundle.
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
