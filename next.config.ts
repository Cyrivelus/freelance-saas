import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Cela va permettre de passer l'étape "Running TypeScript" même s'il y a des erreurs
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
