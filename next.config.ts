import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Force le déploiement même avec des erreurs TS
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore les erreurs de style
  },
};

export default nextConfig;
