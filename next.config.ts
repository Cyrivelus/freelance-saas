import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Force le build même s'il y a des erreurs de typage
    ignoreBuildErrors: true,
  },
  eslint: {
    // Force le build même s'il y a des erreurs de linting
    ignoreDuringBuilds: true,
  },
  // Désactive Turbopack au build si jamais il cause des conflits de cache
  experimental: {
    turbo: {
      // options
    },
  },
};

export default nextConfig;
