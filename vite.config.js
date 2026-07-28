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
      // injectManifest (en vez de generateSW): permite un service worker propio
      // (src/sw.js) con handlers 'push' / 'notificationclick' para el resumen
      // matutino por Web Push, conservando precache/offline/autoUpdate/fallback
      // de navegación (ver docs/push-notifications.md).
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ttf,woff2,ico}'],
      },
      includeAssets: ['iconos/*.svg', 'iconos/*.png', 'fuentes/*.ttf'],
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
            src: 'iconos/icono-app.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'iconos/icono-app.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'iconos/icono-app-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
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
  server: {
    // Evita que el dev server se caiga si un .zip/.7z queda bloqueado por
    // otro proceso (antivirus, sincronización, etc.) mientras se observa
    // el directorio del proyecto.
    watch: {
      ignored: ['**/*.zip', '**/*.7z', '**/*.rar'],
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
