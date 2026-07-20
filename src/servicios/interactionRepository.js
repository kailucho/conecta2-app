// ============================================================
// interactionRepository — acceso a la tabla `interactions` de Supabase.
// No conoce la cola offline ni el estado de React: solo sabe hablar con la
// base de datos. `colaOffline.js` lo usa para drenar operaciones pendientes.
// ============================================================

import { supabase, supabaseConfigurado } from './supabaseClient.js'

const SIN_CONFIGURAR = { ok: false, motivo: 'supabase_no_configurado' }

/** Mapea una interacción local (camelCase) a una fila de `interactions`. */
export function interaccionARemota(interaccion) {
  return {
    id: interaccion.id,
    couple_id: interaccion.coupleId,
    sender_id: interaccion.senderId,
    receiver_id: interaccion.receiverId,
    type: interaccion.type,
    action_id: interaccion.actionId || null,
    category: interaccion.category || null,
    note: interaccion.note || null,
    valence: interaccion.valencia != null ? String(interaccion.valencia) : null,
    status: mapearStatusARemoto(interaccion.status),
    response_text: interaccion.respuestaTexto || null,
    client_created_at: interaccion.createdAt || null,
    responded_at: interaccion.respondedAt || null,
    expires_at: interaccion.expiresAt || null,
  }
}

/** Mapea una fila remota a la forma local usada por AppContexto/BandejaPareja. */
export function interaccionALocal(fila) {
  return {
    id: fila.id,
    coupleId: fila.couple_id,
    senderId: fila.sender_id,
    receiverId: fila.receiver_id,
    type: fila.type,
    actionId: fila.action_id,
    category: fila.category,
    note: fila.note,
    valencia: fila.valence,
    status: mapearStatusALocal(fila.status),
    respuestaTexto: fila.response_text,
    createdAt: fila.client_created_at || fila.created_at,
    respondedAt: fila.responded_at,
    expiresAt: fila.expires_at,
    syncState: 'synced',
  }
}

// El status funcional remoto no distingue 'pendiente_sync' (eso es solo
// syncState local); toda interacción no reconocida/cancelada es 'active'.
function mapearStatusARemoto(status) {
  if (status === 'acknowledged') return 'acknowledged'
  if (status === 'cancelled') return 'cancelled'
  if (status === 'expired') return 'expired'
  return 'active'
}

function mapearStatusALocal(status) {
  return status === 'active' ? 'pendiente_sync' : status
}

/** Envía (upsert) una interacción. Idempotente por `id`. */
export async function enviar(interaccion) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { error } = await supabase
    .from('interactions')
    .upsert(interaccionARemota(interaccion), { onConflict: 'id' })
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  return { ok: true }
}

/** El receptor reconoce/responde una interacción. */
export async function responder(id, { respuestaTexto = null } = {}) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { error } = await supabase
    .from('interactions')
    .update({
      status: 'acknowledged',
      response_text: respuestaTexto,
      responded_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  return { ok: true }
}

/** El emisor cancela su propia interacción. */
export async function cancelar(id) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { error } = await supabase
    .from('interactions')
    .update({ status: 'cancelled' })
    .eq('id', id)
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  return { ok: true }
}

/** Lista las interacciones remotas de una pareja (para fusionar con la caché local). */
export async function listarRemotas(coupleId) {
  if (!supabaseConfigurado || !coupleId) return { ok: false, motivo: 'supabase_no_configurado' }
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  return { ok: true, interacciones: (data || []).map(interaccionALocal) }
}

/**
 * Se suscribe a cambios Realtime (Postgres Changes) de `interactions` para
 * una pareja específica. Devuelve una función para cancelar la suscripción.
 */
export function suscribirRealtime(coupleId, alCambio) {
  if (!supabaseConfigurado || !coupleId) return () => {}
  const canal = supabase
    .channel(`interactions:couple:${coupleId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'interactions', filter: `couple_id=eq.${coupleId}` },
      (payload) => {
        if (payload.new && Object.keys(payload.new).length > 0) {
          alCambio(interaccionALocal(payload.new))
        }
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(canal)
  }
}
