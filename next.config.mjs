/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Removed 'output: export' to allow middleware functionality
  // For Capacitor, use dev server or build without static export
  trailingSlash: true,
}

export default nextConfig
