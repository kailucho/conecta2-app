// ============================================================
// coupleService — envuelve las funciones RPC de vinculación de pareja.
// El frontend nunca inserta directamente en couple_members: todo pasa por
// las funciones SECURITY DEFINER definidas en las migraciones.
// ============================================================

import { supabase, supabaseConfigurado } from './supabaseClient.js'

const SIN_CONFIGURAR = { ok: false, motivo: 'supabase_no_configurado' }

const MOTIVOS_RPC = new Set([
  'usuario_ya_vinculado',
  'codigo_invalido',
  'codigo_revocado',
  'codigo_ya_usado',
  'codigo_expirado',
  'no_puedes_aceptar_tu_propio_codigo',
  'pareja_completa',
  'no_autenticado',
])

function motivoDesdeError(error) {
  const msg = (error?.message || '').trim()
  if (MOTIVOS_RPC.has(msg)) return msg
  if (msg.toLowerCase().includes('network')) return 'sin_conexion'
  return 'error_inesperado'
}

/** Crea (o reutiliza) la pareja pendiente del usuario y genera un código de invitación. */
export async function crearInvitacion() {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { data, error } = await supabase.rpc('create_couple_invite')
  if (error) return { ok: false, motivo: motivoDesdeError(error) }
  const fila = Array.isArray(data) ? data[0] : data
  return {
    ok: true,
    codigo: fila.code,
    coupleId: fila.couple_id,
    expiraEl: fila.expires_at,
  }
}

/** Ingresa un código de invitación para vincularse con la pareja del creador. */
export async function aceptarInvitacion(codigo) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { data, error } = await supabase.rpc('accept_couple_invite', { p_code: codigo })
  if (error) return { ok: false, motivo: motivoDesdeError(error) }
  const fila = Array.isArray(data) ? data[0] : data
  return { ok: true, coupleId: fila.couple_id }
}

/** Revoca una invitación propia aún no aceptada. */
export async function revocarInvitacion(inviteId) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { error } = await supabase.rpc('revoke_couple_invite', { p_invite_id: inviteId })
  if (error) return { ok: false, motivo: motivoDesdeError(error) }
  return { ok: true }
}

/** Desvincula al usuario actual de su pareja activa. */
export async function salirPareja() {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { error } = await supabase.rpc('leave_couple')
  if (error) return { ok: false, motivo: motivoDesdeError(error) }
  return { ok: true }
}

/**
 * Devuelve el estado actual de vinculación del usuario: su couple_id, el
 * partnerId (si ya hay 2 miembros) y la invitación pendiente más reciente
 * que él mismo creó (para poder mostrarla/copiarla de nuevo).
 */
export async function parejaActual() {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const { data: userData } = await supabase.auth.getUser()
  const usuario = userData?.user
  if (!usuario) return { ok: false, motivo: 'sesion_expirada' }

  const { data: miembros, error: errMiembros } = await supabase
    .from('couple_members')
    .select('couple_id, user_id, left_at')
    .eq('user_id', usuario.id)
    .is('left_at', null)
    .limit(1)

  if (errMiembros) return { ok: false, motivo: 'error_inesperado' }
  const miPertenencia = miembros?.[0]
  if (!miPertenencia) return { ok: true, coupleId: null, partnerId: null, invitacionPendiente: null }

  const { data: todosMiembros, error: errTodos } = await supabase
    .from('couple_members')
    .select('user_id')
    .eq('couple_id', miPertenencia.couple_id)
    .is('left_at', null)

  if (errTodos) return { ok: false, motivo: 'error_inesperado' }
  const partnerId = (todosMiembros || []).map((m) => m.user_id).find((id) => id !== usuario.id) || null

  let invitacionPendiente = null
  if (!partnerId) {
    const { data: invites } = await supabase
      .from('couple_invites')
      .select('id, expires_at, revoked_at, accepted_at, created_at')
      .eq('couple_id', miPertenencia.couple_id)
      .eq('created_by', usuario.id)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
    invitacionPendiente = invites?.[0] || null
  }

  return { ok: true, coupleId: miPertenencia.couple_id, partnerId, invitacionPendiente }
}
