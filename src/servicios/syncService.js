// ============================================================
// syncService — STUB de sincronización entre dispositivos (Fase 2).
//
// En Fase 1 todo es local. Este servicio existe para que el resto del código
// ya hable el "idioma" de la sincronización: encolar mensajes de salida y
// consultar el estado. Cuando llegue el backend, aquí se implementa el
// envío real sin cambiar los consumidores.
// ============================================================

import { obtener, CLAVES } from './storageService.js'
import { supabaseConfigurado } from './supabaseClient.js'

export const ESTADOS_VINCULACION = {
  NO_VINCULADA: 'no_vinculada',
  PENDIENTE: 'pendiente',
  VINCULADA: 'vinculada',
}

/**
 * ¿Está la pareja vinculada? Verdadero solo con coupleId + partnerId reales
 * (asignados por el flujo de vinculación de Supabase).
 */
export function parejaVinculada(perfil) {
  return Boolean(
    perfil?.estadoVinculacion === ESTADOS_VINCULACION.VINCULADA &&
    perfil?.coupleId &&
    perfil?.partnerId &&
    perfil.partnerId !== perfil.userId
  )
}

/** La vinculación entre dispositivos requiere Supabase configurado. */
export function vinculacionDisponible() {
  return supabaseConfigurado
}

/**
 * Devuelve cuántos mensajes hay esperando sincronizarse con la pareja.
 */
export async function pendientesDeSync() {
  const cola = await obtener(CLAVES.colaSalida, [])
  return cola.length
}

/**
 * Intenta drenar la cola de salida. En Fase 1 es un no-op que simplemente
 * reporta que no hay conexión de pareja todavía.
 */
export async function drenarCola(perfil) {
  if (!parejaVinculada(perfil)) {
    return { enviados: 0, motivo: 'sin_pareja_vinculada' }
  }
  if (!vinculacionDisponible()) {
    return { enviados: 0, motivo: 'vinculacion_no_disponible' }
  }
  // Fase 2: aquí iría el POST al backend y el vaciado de la cola.
  return { enviados: 0 }
}

/**
 * Genera un código de invitación de pareja (mostrado como "próximamente").
 */
export function generarCodigoInvitacion(coupleId) {
  // Toma trozos del coupleId para un código legible de 6 caracteres.
  return (coupleId || '').replace(/-/g, '').slice(0, 6).toUpperCase()
}
