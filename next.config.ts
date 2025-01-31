import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static exports
  distDir: 'dist',   // Optional: customize build output directory
  images: {
    unoptimized: true, // Required for static exports
  },
  // Disable server features since this is static
  trailingSlash: true, // Recommended for static exports
  eslint: {
    ignoreDuringBuilds: true, // Optional: completely disable ESLint during builds
    // Or use this to configure specific rules:
 
    
  }
};

export default nextConfig;
