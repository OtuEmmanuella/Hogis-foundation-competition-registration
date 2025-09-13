// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  
  // Fix for cross-origin requests
  allowedDevOrigins: [
    "172.16.5.153",
    "localhost",
    "127.0.0.1"
  ],
  
  // Enable experimental features for better server-side compatibility
  experimental: {
    serverComponentsExternalPackages: ['nodemailer']
  },
  
  // Webpack configuration for better module resolution
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      // Don't externalize nodemailer for server-side rendering
      config.resolve.alias = {
        ...config.resolve.alias,
        nodemailer: require.resolve('nodemailer')
      };
    }
    return config;
  },
  
  // Add environment variable configuration
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
};

export default nextConfig;