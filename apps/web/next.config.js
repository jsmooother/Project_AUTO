/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/shared'],
};

// Log configuration on startup
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
console.log(`[Web] NEXT_PUBLIC_API_URL: ${apiUrl}`);

module.exports = nextConfig;
