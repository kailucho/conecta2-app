// ============================================================
// profileService — mapea el perfil local (español, camelCase) con la tabla
// `profiles` de Supabase (inglés, snake_case) y expone operaciones de
// lectura/escritura del perfil remoto del usuario autenticado.
// ============================================================

import { supabase, supabaseConfigurado } from './supabaseClient.js'
import { normalizarTipoRelacion } from '../datos/lenguaje.js'

/** Perfil remoto (fila `profiles`) -> forma local usada por AppContexto. */
export function perfilRemotoALocal(fila, perfilLocalPrevio = {}) {
  if (!fila) return null
  return {
    ...perfilLocalPrevio,
    userId: fila.id,
    nombre: fila.display_name || perfilLocalPrevio.nombre || '',
    rol: fila.app_role,
    tipoRelacion: normalizarTipoRelacion(fila.relationship_type),
    tonoHumor: fila.humor_tone,
    privacidadHormonal: fila.hormonal_privacy,
    legacyLocalUserId: fila.legacy_local_user_id || perfilLocalPrevio.legacyLocalUserId || null,
  }
}

/** Perfil local -> columnas de `profiles` para upsert. */
function perfilLocalARemoto(perfil, userId) {
  return {
    id: userId,
    display_name: perfil.nombre || null,
    app_role: perfil.rol,
    relationship_type: normalizarTipoRelacion(perfil.tipoRelacion) || null,
    humor_tone: perfil.tonoHumor || null,
    hormonal_privacy: perfil.privacidadHormonal || null,
    legacy_local_user_id: perfil.legacyLocalUserId || perfil.userId || null,
  }
}

/** Obtiene el perfil remoto del usuario autenticado (o null si no existe aún). */
export async function obtenerPerfil() {
  if (!supabaseConfigurado) return { ok: false, motivo: 'supabase_no_configurado' }
  const { data: userData } = await supabase.auth.getUser()
  const usuario = userData?.user
  if (!usuario) return { ok: false, motivo: 'sesion_expirada' }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', usuario.id)
    .maybeSingle()

  if (error) return { ok: false, motivo: 'error_inesperado' }
  return { ok: true, perfil: data }
}

/** Crea o actualiza el perfil remoto del usuario autenticado. */
export async function upsertPerfil(perfilLocal) {
  if (!supabaseConfigurado) return { ok: false, motivo: 'supabase_no_configurado' }
  const { data: userData } = await supabase.auth.getUser()
  const usuario = userData?.user
  if (!usuario) return { ok: false, motivo: 'sesion_expirada' }

  const fila = perfilLocalARemoto(perfilLocal, usuario.id)
  const { data, error } = await supabase
    .from('profiles')
    .upsert(fila, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) return { ok: false, motivo: 'error_inesperado' }
  return { ok: true, perfil: data }
}
