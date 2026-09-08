import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  outputFileTracingRoot: process.cwd(),
  compiler: {
    styledComponents: true,
  },
  // Add headers configuration
  async headers() {
    return [
      {
        source: '/photography/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  webpack: (config, { dev, isServer }) => {
    // Ensure development mode is properly set
    if (dev && !isServer) {
      config.mode = 'development';
    }
    return config;
  }
};

export default nextConfig;
