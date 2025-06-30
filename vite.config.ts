import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    // Add Sentry plugin for source maps and release management
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourceMaps: {
        assets: './dist/**',
      },
      release: {
        name: process.env.VITE_APP_VERSION || '1.0.0',
      },
      // Only upload source maps in production
      disable: process.env.NODE_ENV !== 'production',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable source maps for Sentry
  }
});