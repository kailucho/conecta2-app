// ============================================================
// Service Worker propio (injectManifest). Conserva TODO el comportamiento
// previo de generateSW: precache de la app, autoUpdate, fallback de
// navegación a index.html, limpieza de cachés viejas. Además añade los
// handlers de Web Push (Nivel 2/3 del resumen matutino):
//   - 'push'            → muestra la notificación recibida del servidor.
//   - 'notificationclick' → abre/enfoca la pantalla Hoy de la app.
// ============================================================

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

// Inyectado por vite-plugin-pwa (injectManifest) con la lista real de assets.
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Mismo comportamiento que navigateFallback: '/index.html' en generateSW.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')))

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  let datos = {}
  try {
    datos = event.data.json()
  } catch {
    datos = { titulo: 'Conecta2', cuerpo: event.data.text() }
  }
  const titulo = datos.titulo || 'Conecta2 tiene listo tu resumen de hoy.'
  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.cuerpo || '',
      icon: '/iconos/icono-app.png',
      badge: '/iconos/badge-monocromo.png',
      silent: !!datos.silencio,
      data: { url: '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      const existente = lista.find((c) => c.url.includes(self.location.origin))
      if (existente) return existente.focus()
      return self.clients.openWindow(url)
    }),
  )
})
