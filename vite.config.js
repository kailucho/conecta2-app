import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// Configuración de Vite + PWA instalable y offline.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['iconos/*.svg', 'fuentes/*.ttf'],
      manifest: {
        name: 'Conecta2',
        short_name: 'Conecta2',
        description: 'Una app para entenderse mejor en pareja 💙💗',
        theme_color: '#071827',
        background_color: '#071827',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'iconos/icono-app.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'iconos/icono-app.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: 'iconos/icono-app.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache de toda la app para que funcione 100% offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ttf,woff2,ico}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
