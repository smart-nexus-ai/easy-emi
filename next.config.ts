import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

const configureConfig = () => {
  if (process.env.ENABLE_PWA === 'true') {
    try {
      // @ts-ignore
      const withPWA = require('@ducanh2912/next-pwa').default;
      return withPWA({
        dest: 'public',
        disable: false,
      })(nextConfig);
    } catch (e) {
      console.warn('PWA module not found, fallback to standard configuration.');
      return nextConfig;
    }
  }
  return nextConfig;
};

export default configureConfig();
