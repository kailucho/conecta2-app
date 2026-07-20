// ============================================================
// syncService — STUB de sincronización entre dispositivos (Fase 2).
//
// En Fase 1 todo es local. Este servicio existe para que el resto del código
// ya hable el "idioma" de la sincronización: encolar mensajes de salida y
// consultar el estado. Cuando llegue el backend, aquí se implementa el
// envío real sin cambiar los consumidores.
// ============================================================

import { obtener, guardar, CLAVES } from './storageService.js'

/**
 * ¿Está la pareja vinculada? En Fase 1 siempre false.
 */
export function parejaVinculada() {
  return false
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
export async function drenarCola() {
  if (!parejaVinculada()) {
    return { enviados: 0, motivo: 'sin_pareja_vinculada' }
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
