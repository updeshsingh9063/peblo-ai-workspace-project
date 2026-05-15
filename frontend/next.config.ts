import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any HTTPS source for user avatars
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Silence experimental warning for server actions (used via forms)
  experimental: {},
};

export default nextConfig;
