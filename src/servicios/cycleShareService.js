// ============================================================
// cycleShareService — publica y lee el resumen COMPARTIDO del ciclo.
//
// El ciclo real (registrosRegla, síntomas, etc.) nunca sale del dispositivo:
// aquí solo se deriva un snapshot ya filtrado según hormonal_privacy
// ('todo' | 'solo_fases' | 'solo_alertas') antes de subirlo. Reutiliza el
// motor puro (src/motor/motorCiclo.js) para no duplicar cálculos.
// ============================================================

import { supabase, supabaseConfigurado } from './supabaseClient.js'
import { calcularDiaCiclo, obtenerFase, esZonaRoja } from '../motor/motorCiclo.js'
import { ultimaRegla } from '../contexto/usarCiclo.js'

const SIN_CONFIGURAR = { ok: false, motivo: 'supabase_no_configurado' }

/**
 * Deriva el snapshot compartible a partir del ciclo local y el nivel de
 * privacidad del perfil. Nunca incluye registrosRegla, síntomas ni notas.
 */
export function derivarSnapshot(ciclo, privacidadHormonal = 'todo') {
  const fechaUltima = ultimaRegla(ciclo)
  if (!fechaUltima || ciclo.etapaVida === 'menopausia') return null

  const dia = calcularDiaCiclo(fechaUltima, new Date())
  const fase = obtenerFase(dia, ciclo)
  const alertaGeneral = esZonaRoja(dia, ciclo)

  return {
    visible_phase: privacidadHormonal === 'solo_alertas' ? null : fase.id,
    cycle_day: privacidadHormonal === 'todo' ? dia : null,
    general_alert: alertaGeneral,
    privacy_level: privacidadHormonal,
  }
}

/** Sube (upsert) el snapshot propio para que la pareja activa pueda leerlo. */
export async function publicarSnapshot(ciclo, perfil) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  if (!perfil?.coupleId || !perfil?.userId) return { ok: false, motivo: 'sin_pareja_vinculada' }

  const snapshot = derivarSnapshot(ciclo, perfil.privacidadHormonal || 'todo')
  if (!snapshot) return { ok: false, motivo: 'sin_datos' }

  const { error } = await supabase.from('cycle_shared_snapshots').upsert(
    {
      owner_user_id: perfil.userId,
      couple_id: perfil.coupleId,
      ...snapshot,
    },
    { onConflict: 'owner_user_id,couple_id' },
  )
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  return { ok: true }
}

/** Lee el snapshot de la pareja (no el propio) para una pareja dada. */
export async function obtenerSnapshotPareja(coupleId, miUserId) {
  if (!supabaseConfigurado || !coupleId) return SIN_CONFIGURAR
  const { data, error } = await supabase
    .from('cycle_shared_snapshots')
    .select('*')
    .eq('couple_id', coupleId)
    .neq('owner_user_id', miUserId)
    .maybeSingle()

  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  if (!data) return { ok: true, snapshot: null }
  return {
    ok: true,
    snapshot: {
      fase: data.visible_phase,
      dia: data.cycle_day,
      alertaGeneral: data.general_alert,
      nivelPrivacidad: data.privacy_level,
      actualizadoEl: data.updated_at,
    },
  }
}

/** El otro miembro sugiere una posible fecha de inicio de regla. */
export async function sugerirRegla(coupleId, ownerUserId, fechaISO) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { data, error } = await supabase
    .from('period_suggestions')
    .insert({ couple_id: coupleId, owner_user_id: ownerUserId, suggested_start_date: fechaISO })
    .select('id')
    .single()
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  return { ok: true, id: data.id }
}

/** Lista las sugerencias pendientes dirigidas a mí (la propietaria). */
export async function sugerenciasPendientes(miUserId) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { data, error } = await supabase
    .from('period_suggestions')
    .select('*')
    .eq('owner_user_id', miUserId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  return { ok: true, sugerencias: data || [] }
}

/** La propietaria acepta o rechaza una sugerencia (vía RPC, nunca escribe datos privados). */
export async function responderSugerencia(id, aceptar) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { error } = await supabase.rpc('respond_period_suggestion', { p_id: id, p_aceptar: aceptar })
  if (error) return { ok: false, motivo: 'error_inesperado', detalle: error.message }
  return { ok: true }
}
