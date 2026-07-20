// ============================================================
// migracionLocal — migración versionada e idempotente de los datos creados
// en modo local (antes de tener cuenta) hacia el usuario autenticado.
//
// No borra localStorage: solo asocia el perfil local a auth.uid() y sube el
// perfil remoto. Las interacciones dirigidas a una pareja no vinculada NO se
// migran (podrían apuntar a un partnerId ficticio de una versión anterior).
// ============================================================

import { obtener, guardar, CLAVES } from './storageService.js'
import { upsertPerfil } from './profileService.js'

const VERSION_ACTUAL = 1

/**
 * Ejecuta la migración para el usuario autenticado `usuarioId`. Es segura de
 * llamar en cada login: si ya se migró para ese usuario, no hace nada.
 */
export async function migrarSiHaceFalta(usuarioId) {
  if (!usuarioId) return { migrado: false, motivo: 'sin_usuario' }

  const estado = await obtener(CLAVES.migracion, { version: 0, usuarioId: null })
  if (estado.version >= VERSION_ACTUAL && estado.usuarioId === usuarioId) {
    return { migrado: false, motivo: 'ya_migrado' }
  }

  const perfil = await obtener(CLAVES.perfil, null)
  if (!perfil) return { migrado: false, motivo: 'sin_perfil_local' }

  const legacyLocalUserId = perfil.userId && perfil.userId !== usuarioId
    ? perfil.userId
    : perfil.legacyLocalUserId || null

  const perfilMigrado = {
    ...perfil,
    userId: usuarioId,
    legacyLocalUserId,
  }

  const guardadoLocal = await guardar(CLAVES.perfil, perfilMigrado)
  if (!guardadoLocal) return { migrado: false, motivo: 'error_persistencia' }

  const resultadoRemoto = await upsertPerfil(perfilMigrado)
  if (!resultadoRemoto.ok) {
    // El perfil local ya quedó asociado al usuario; se reintentará el
    // upsert remoto en el próximo login/drenaje sin perder el progreso.
    return { migrado: false, motivo: resultadoRemoto.motivo, perfil: perfilMigrado }
  }

  await guardar(CLAVES.migracion, { version: VERSION_ACTUAL, usuarioId })
  return { migrado: true, perfil: perfilMigrado }
}
