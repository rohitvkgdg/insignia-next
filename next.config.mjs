import { withNextVideo } from "next-video/process";
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'r2.sdmcetinsignia.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5174",
        process.env.NEXT_PUBLIC_API_URL ?? "https://app.sdmcetinsignia.com",
      ],
    },
    // This can help prevent certain hydration errors
    largePageDataBytes: 128 * 1000, // 128KB 
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
  onDemandEntries: {
    // Maximum period to keep a page in memory
    maxInactiveAge: 25 * 1000,
    // Number of pages to keep in memory
    pagesBufferLength: 5,
  },
}

export default withNextVideo(nextConfig);