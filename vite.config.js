import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Health check plugin
const healthCheckPlugin = () => ({
  name: 'health-check',
  configureServer(server) {
    server.middlewares.use('/api/health', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'ok',
        app: 'Daily Expense Manager',
        version: '1.4.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      }));
    });
  }
});

// Get base path from environment variable (for GitHub Pages)
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    healthCheckPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.svg',
        'pwa-192x192.svg',
        'pwa-512x512.svg'
      ],
      manifest: {
        name: 'Daily Expense Manager',
        short_name: 'Expenses',
        description: 'Track your daily expenses and income with ease. Features include categories, payment methods, reminders, reports, and more.',
        theme_color: '#4F46E5',
        background_color: '#f3f4f6',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        categories: ['finance', 'productivity', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            form_factor: 'narrow',
            label: 'Daily Expense Manager'
          }
        ],
        shortcuts: [
          {
            name: 'Add Expense',
            short_name: 'Expense',
            description: 'Quickly add a new expense',
            url: `${base}add/expense`,
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }]
          },
          {
            name: 'Add Income',
            short_name: 'Income',
            description: 'Quickly add a new income',
            url: `${base}add/income`,
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }]
          },
          {
            name: 'View Reports',
            short_name: 'Reports',
            description: 'View your expense reports',
            url: `${base}reports`,
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
