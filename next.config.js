/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow Supabase storage CDN + common image hosts
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  transpilePackages: ["@supabase/supabase-js"],
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
