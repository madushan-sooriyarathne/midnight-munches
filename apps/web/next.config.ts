import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@midnightmunches/ui', '@midnightmunches/types'],
};

export default nextConfig;
