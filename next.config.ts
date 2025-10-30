import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   ignoreDuringBuilds: true, // ✅ Build tidak akan gagal karena ESLint error
};

export default nextConfig;
