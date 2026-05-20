import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
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
    // Optimized for bolt.new environment
    hmr: {
      overlay: true,
      timeout: 10000
    },
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.env']
    }
  },
  publicDir: 'public',
  build: {
    target: 'esnext',
    sourcemap: true,
    assetsInlineLimit: 0,
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

          // Split admin components into smaller chunks
          if (id.includes('src/components/admin')) {
            if (id.includes('Analytics') || id.includes('Error')) {
              return 'admin-analytics';
            }
            if (id.includes('Email') || id.includes('Notification')) {
              return 'admin-email';
            }
            if (id.includes('Compliance') || id.includes('Security') || id.includes('HIPAA') || id.includes('ISO') || id.includes('BAA') || id.includes('GDPR')) {
              return 'admin-compliance';
            }
            if (id.includes('Translation') || id.includes('Media') || id.includes('Photo')) {
              return 'admin-content';
            }
            if (id.includes('Appointment') || id.includes('Consultation') || id.includes('Booking')) {
              return 'admin-appointments';
            }
            return 'admin-core';
          }

          if (id.includes('src/services')) {
            if (id.includes('analytics') || id.includes('ga4')) {
              return 'service-analytics';
            }
            if (id.includes('email') || id.includes('notification')) {
              return 'service-email';
            }
            if (id.includes('compliance') || id.includes('hipaa') || id.includes('audit')) {
              return 'service-compliance';
            }
            return 'services';
          }

          if (id.includes('src/components/booking') || id.includes('src/components/gallery')) {
            return 'booking-gallery';
          }

          if (id.includes('src/pages/procedures')) {
            return 'procedures';
          }

          if (id.includes('src/pages')) {
            return 'pages';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/mp4|webm|ogg|mp3|wav|flac|aac/i.test(ext)) {
            return `assets/videos/[name][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'i18next',
      'react-i18next',
      'i18next-browser-languagedetector',
      'i18next-http-backend',
      'js-cookie',
      'lucide-react',
      '@supabase/supabase-js'
    ],
    exclude: ['fsevents'],
    esbuildOptions: {
      target: 'esnext',
      keepNames: true,
      define: {
        global: 'globalThis'
      }
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