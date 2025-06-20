// next.config.js
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        tls: false,
        net: false, // Disables the polyfill for 'net' module
        dgram: false, // Disables the polyfill for 'dgram' module
        dns: false, // Disables the polyfill for 'dgram' module
      }
    }

    if (process.env.VERCEL_ENV === 'preview') {
      config.optimization.minimize = false
    }

    return config
  },
  turbopack: {
    resolveAlias: {
      '@drift-labs/sdk': '../drift-common/protocol/sdk',
      '@drift-labs/icons': '../drift-common/icons/dist/',
      '@drift/common': '../drift-common/common-ts/lib/index.js',
      '@drift-labs/react': '../drift-common/react/lib/index.js',
      react: './node_modules/@types/react',
      fs: { browser: './node-browser-compatibility.js' },
      net: { browser: './node-browser-compatibility.js' },
      dns: { browser: './node-browser-compatibility.js' },
      tls: { browser: './node-browser-compatibility.js' },
      crypto: { browser: 'crypto-browserify' },
    },
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
