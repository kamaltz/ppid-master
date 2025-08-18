import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs', 'jsonwebtoken'],
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  }
};

export default nextConfig;