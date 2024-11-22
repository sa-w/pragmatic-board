import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/board',
        permanent: true,
      },
    ];
  },
  devIndicators: {
    // Disable "static route" dev indicator
    appIsrStatus: false,
  },
};

export default nextConfig;
