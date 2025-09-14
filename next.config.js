/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    domains: ['localhost', '167.172.83.55'],
    unoptimized: true
  }
}

module.exports = nextConfig