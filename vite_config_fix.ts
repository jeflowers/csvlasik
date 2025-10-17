/**
 * @file vite.config.ts
 * @description Vite configuration with YouTube embed support
 * @author Development
 * @filepath csvlasik/vite.config.ts
 * @category Config
 * @version 1.0.0
 * @last_updated 2025-10-17
 * 
 * @environment_variables
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous key
 * 
 * @features
 * - YouTube embed support (no CSP restrictions)
 * - Path aliases (@/ for src)
 * - React Fast Refresh
 * - TypeScript support
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    port: 5173,
    host: true,
    // CRITICAL: Do not set restrictive headers that block YouTube
    headers: {
      // Allow YouTube embeds - do NOT set restrictive CSP
      // If you must use CSP, include these:
      // 'Content-Security-Policy': "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;"
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});