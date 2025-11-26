/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  rewrites: async () => {
    return [
      {
        source: '/:username/:path*',
        destination: '/sites/:username/:path*',
        has: [
          {
            type: 'header',
            key: 'x-site-request',
          },
        ],
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sites/:username/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
