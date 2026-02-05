/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
};

export default nextConfig;
