import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Walrus Sites deployment
  output: 'export',
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  
  // Disable trailing slashes for cleaner URLs
  trailingSlash: false,
};

export default nextConfig;
