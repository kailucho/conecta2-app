// ============================================================
// colaOffline — drena la cola de operaciones pendientes (storageService)
// contra Supabase, con reintentos, backoff básico, límite de intentos y
// bloqueo anti-concurrencia (evita drenar dos veces al mismo tiempo, p.ej.
// si se dispara por 'online' y por foco de la app a la vez).
//
// No borra una operación de la cola hasta confirmar que Supabase la procesó.
// ============================================================

import {
  listarOperaciones,
  actualizarOperacion,
  eliminarOperacion,
} from './storageService.js'
import { enviar, responder, cancelar } from './interactionRepository.js'
import { supabaseConfigurado } from './supabaseClient.js'

const MAX_INTENTOS = 6
const BASE_BACKOFF_MS = 2000

let drenando = false

function backoffVencido(operacion) {
  if (operacion.attempts === 0) return true
  const espera = Math.min(BASE_BACKOFF_MS * 2 ** (operacion.attempts - 1), 60000)
  const ultimaActualizacion = new Date(operacion.updatedAt).getTime()
  return Date.now() - ultimaActualizacion >= espera
}

async function ejecutarOperacion(operacion) {
  if (operacion.entity !== 'interactions') {
    return { ok: false, motivo: 'entidad_no_soportada' }
  }
  switch (operacion.action) {
    case 'insert':
    case 'upsert':
      return enviar(operacion.payload)
    case 'update': {
      if (operacion.payload?.tipo === 'cancelar') return cancelar(operacion.entityId)
      return responder(operacion.entityId, operacion.payload)
    }
    default:
      return { ok: false, motivo: 'accion_no_soportada' }
  }
}

/**
 * Intenta procesar toda la cola. Seguro de llamar múltiples veces seguidas:
 * si ya hay un drenaje en curso, la llamada se ignora.
 */
export async function drenarCola() {
  if (!supabaseConfigurado) return { procesadas: 0, motivo: 'supabase_no_configurado' }
  if (drenando) return { procesadas: 0, motivo: 'drenaje_en_curso' }

  drenando = true
  let procesadas = 0
  try {
    const cola = await listarOperaciones()
    // Deduplica por (entity, action, entityId): conserva solo la más reciente.
    const vistos = new Set()
    const aProcesar = []
    for (let i = cola.length - 1; i >= 0; i--) {
      const op = cola[i]
      const clave = `${op.entity}:${op.action}:${op.entityId}`
      if (vistos.has(clave)) continue
      vistos.add(clave)
      aProcesar.unshift(op)
    }

    for (const operacion of aProcesar) {
      if (operacion.attempts >= MAX_INTENTOS) continue
      if (!backoffVencido(operacion)) continue

      const resultado = await ejecutarOperacion(operacion)
      if (resultado.ok) {
        await eliminarOperacion(operacion.operationId)
        procesadas += 1
      } else {
        await actualizarOperacion(operacion.operationId, {
          attempts: operacion.attempts + 1,
          lastError: resultado.motivo || 'error_inesperado',
        })
      }
    }
  } finally {
    drenando = false
  }
  return { procesadas }
}

/** Instala los listeners recomendados por el plan para redrenar la cola. */
export function instalarListenersDrenaje() {
  if (typeof window === 'undefined') return () => {}

  const alVolverOnline = () => drenarCola()
  const alVisible = () => {
    if (document.visibilityState === 'visible') drenarCola()
  }

  window.addEventListener('online', alVolverOnline)
  document.addEventListener('visibilitychange', alVisible)

  return () => {
    window.removeEventListener('online', alVolverOnline)
    document.removeEventListener('visibilitychange', alVisible)
  }
}
