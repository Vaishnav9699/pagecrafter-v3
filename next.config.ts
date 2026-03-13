import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  },
};

export default nextConfig;
