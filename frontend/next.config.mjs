/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during production builds to avoid config/version issues on Render
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

