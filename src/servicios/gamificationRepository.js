// ============================================================
// gamificationRepository — capa remota de la gamificación por eventos.
// El cálculo local (motor/gamificacion.js, anti-spam por ventana) sigue
// siendo la fuente de verdad offline; este servicio solo agrega una
// consistencia entre dispositivos, registrando cada evento en `point_events`
// y permitiendo reconciliar el total con lo que la pareja también ve.
// ============================================================

import { supabase, supabaseConfigurado } from './supabaseClient.js'
import { calcularNivel } from '../motor/gamificacion.js'

const SIN_CONFIGURAR = { ok: false, motivo: 'supabase_no_configurado' }

/**
 * Registra un evento de puntos. `claveAntiSpam` (p.ej. "aprecio:2026-07-20")
 * se reutiliza como dedupe_key: el servidor decide el valor de puntos según
 * el tipo (prefijo antes de ":"), nunca el cliente.
 */
export async function registrarEvento(claveAntiSpam, interactionId = null) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  if (!claveAntiSpam) return { ok: false, motivo: 'clave_requerida' }

  const eventType = claveAntiSpam.split(':')[0]
  const { data, error } = await supabase.rpc('award_points', {
    p_event_type: eventType,
    p_dedupe_key: claveAntiSpam,
    p_interaction_id: interactionId,
  })
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  const fila = Array.isArray(data) ? data[0] : data
  return { ok: true, otorgado: fila.awarded, puntos: fila.points }
}

/**
 * Suma los puntos de cada miembro de la pareja a partir de `point_events` y
 * deriva el nivel de cada uno con el mismo motor que usa la UI local.
 */
export async function resumenPareja(coupleId) {
  if (!supabaseConfigurado || !coupleId) return SIN_CONFIGURAR
  const { data, error } = await supabase
    .from('point_events')
    .select('user_id, points')
    .eq('couple_id', coupleId)

  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }

  const totales = {}
  for (const fila of data || []) {
    totales[fila.user_id] = (totales[fila.user_id] || 0) + fila.points
  }
  const porUsuario = Object.fromEntries(
    Object.entries(totales).map(([userId, puntos]) => [userId, { puntos, nivel: calcularNivel(puntos) }]),
  )
  return { ok: true, porUsuario }
}
