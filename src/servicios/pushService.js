// ============================================================
// pushService — suscripción Web Push (Nivel 2). Registra/revoca la
// PushSubscription del navegador y la guarda en Supabase asociada al
// usuario autenticado. En modo local (sin Supabase) no hace nada: el
// resumen matutino sigue funcionando en Nivel 1 (app abierta).
// ============================================================

import { supabase, supabaseConfigurado } from './supabaseClient.js'

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const base64Normalizado = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64Normalizado)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

/**
 * ¿El navegador soporta Web Push? (requiere Service Worker + Push API).
 */
export function pushSoportado() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * Suscribe este dispositivo a Web Push y guarda la suscripción en Supabase.
 * Requiere: soporte del navegador, Supabase configurado, sesión iniciada, y
 * una clave pública VAPID (VITE_VAPID_PUBLIC_KEY).
 */
export async function suscribirPush() {
  if (!pushSoportado()) return { ok: false, motivo: 'no_soportado' }
  if (!supabaseConfigurado) return { ok: false, motivo: 'supabase_no_configurado' }

  const vapidPublica = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidPublica) return { ok: false, motivo: 'vapid_no_configurada' }

  const { data: sesion } = await supabase.auth.getSession()
  const usuario = sesion?.session?.user
  if (!usuario) return { ok: false, motivo: 'sesion_expirada' }

  try {
    const registro = await navigator.serviceWorker.ready
    const suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublica),
    })
    const json = suscripcion.toJSON()

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: usuario.id,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth_key: json.keys.auth,
        user_agent: navigator.userAgent,
      },
      { onConflict: 'endpoint' },
    )
    if (error) return { ok: false, motivo: 'error_guardando' }
    return { ok: true }
  } catch {
    return { ok: false, motivo: 'permiso_denegado' }
  }
}

/**
 * Revoca la suscripción de este dispositivo (local y en Supabase).
 */
export async function revocarPush() {
  if (!pushSoportado()) return { ok: false, motivo: 'no_soportado' }
  try {
    const registro = await navigator.serviceWorker.ready
    const suscripcion = await registro.pushManager.getSubscription()
    if (!suscripcion) return { ok: true }
    const endpoint = suscripcion.endpoint
    await suscripcion.unsubscribe()
    if (supabaseConfigurado) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    }
    return { ok: true }
  } catch {
    return { ok: false, motivo: 'error_inesperado' }
  }
}
