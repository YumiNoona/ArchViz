/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  transpilePackages: ["@supabase/supabase-js"],
};

module.exports = nextConfig;
