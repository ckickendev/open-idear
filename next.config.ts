import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  sassOptions: {
    implementation: 'sass-embedded',
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: '',
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.spiderum.com",
        pathname: "/**",
      },
    ],
  },

}

export default nextConfig