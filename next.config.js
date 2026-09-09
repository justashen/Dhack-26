/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Round 02 submissions have closed; send old links/bookmarks to the
  // active Final Round (Round 3) submission page instead of a 404.
  async redirects() {
    return [
      {
        source: '/round-02-submission',
        destination: '/final-round-submission',
        permanent: false,
      },
    ];
  },
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value:
              process.env.NODE_ENV === 'production'
                ? [
                    "default-src 'self'",
                    "object-src 'none'",
                    // Allow reCAPTCHA and Counter.dev Analytics
                    "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.counter.dev",
                    // "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
                    // Mirror allowances for script elements explicitly
                    "script-src-elem 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://cdn.counter.dev",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com",
                    "img-src 'self' data: https: blob:",
                    // Allow HTTPS and WebSocket connections (e.g., Supabase and other APIs)
                    "connect-src 'self' https: wss:",
                    "frame-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
                    // Allow data URIs for SVG and other inline content
                    "media-src 'self' data: https:",
                  ].join('; ')
                : [
                    "default-src 'self' 'unsafe-eval' 'unsafe-inline'",
                    "object-src 'none'",
                    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
                    "style-src 'self' 'unsafe-inline' https:",
                    "img-src 'self' data: https: blob:",
                    "connect-src 'self' https: wss:",
                    "frame-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
                    "media-src 'self' data: https:",
                  ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Strict Transport Security (only over HTTPS in production)
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
          // Cross-Origin protections
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // DNS prefetch control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
