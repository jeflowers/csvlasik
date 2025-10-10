import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    // CORS configuration for development
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://csvlasik.com',
        'https://www.csvlasik.com'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    },
    // Optimizations for stability
    hmr: {
      overlay: false,
      protocol: 'ws',
      host: 'localhost'
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            return 'vendor-misc';
          }

          if (id.includes('src/components/admin')) {
            return 'admin';
          }

          if (id.includes('src/pages/procedures')) {
            return 'procedures';
          }

          if (id.includes('src/pages')) {
            return 'pages';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    // Force pre-bundling to avoid deadlocks
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'i18next',
      'react-i18next',
      'js-cookie',
      'lucide-react'
    ],
    exclude: ['fsevents'],
    // Optimization for better stability
    esbuildOptions: {
      target: 'esnext',
      keepNames: true
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Additional stability optimizations
  esbuild: {
    jsx: 'automatic'
  }
});