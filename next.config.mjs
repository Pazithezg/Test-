/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use a fresh generated-output directory instead of the stale .next folder.
  distDir: '.next-build',
};

export default nextConfig;
