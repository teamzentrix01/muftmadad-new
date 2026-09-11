import { IMAGE_HOSTS } from './src/lib/image-source.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: IMAGE_HOSTS.map(hostname => ({ protocol: 'https', hostname, port: '' })),
  },
};

export default nextConfig;
