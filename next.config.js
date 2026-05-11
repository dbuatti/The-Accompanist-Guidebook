/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@neondatabase/auth", "@neondatabase/auth-ui"],
};

export default nextConfig;