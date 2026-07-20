// ============================================================
// storageService — capa de abstracción sobre localStorage.
//
// Toda la app lee y escribe SOLO a través de este servicio. La API es
// asíncrona (Promise) aunque hoy localStorage sea síncrono: así, cuando
// migremos a un backend real (Fase 2), cambiamos únicamente este archivo
// sin tocar ningún consumidor.
// ============================================================

const PREFIJO = 'mp:'

// Claves conocidas del modelo de datos.
export const CLAVES = {
  perfil: 'perfil',
  ciclo: 'ciclo',
  config: 'config',
  interacciones: 'interacciones',
  animoObservado: 'animoObservado',
  gamificacion: 'gamificacion',
  nosotros: 'nosotros',
  sos: 'sos',
  colaSalida: 'colaSalida',
  aprecios: 'aprecios',
  // Fase 2: cola offline enriquecida y control de migración.
  colaOperaciones: 'colaOperaciones',
  migracion: 'migracion',
  // IDs de interacciones cuya confirmación/respuesta de la pareja ya viste.
  confirmacionesVistas: 'confirmacionesVistas',
}

function claveCompleta(clave) {
  return PREFIJO + clave
}

/**
 * Lee un valor. Devuelve `porDefecto` si no existe o si hay error de parseo.
 */
export async function obtener(clave, porDefecto = null) {
  try {
    const crudo = localStorage.getItem(claveCompleta(clave))
    if (crudo === null || crudo === undefined) return porDefecto
    return JSON.parse(crudo)
  } catch (e) {
    console.warn(`[storageService] No se pudo leer "${clave}":`, e)
    return porDefecto
  }
}

/**
 * Guarda un valor (se serializa a JSON).
 */
export async function guardar(clave, valor) {
  try {
    localStorage.setItem(claveCompleta(clave), JSON.stringify(valor))
    return true
  } catch (e) {
    console.warn(`[storageService] No se pudo guardar "${clave}":`, e)
    return false
  }
}

/**
 * Elimina una clave.
 */
export async function eliminar(clave) {
  localStorage.removeItem(claveCompleta(clave))
}

/**
 * Borra TODO el namespace de la app (para "reiniciar app" en Ajustes).
 */
export async function limpiarTodo() {
  const aBorrar = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIJO)) aBorrar.push(k)
  }
  aBorrar.forEach((k) => localStorage.removeItem(k))
}

// ---------- Ayudantes específicos para interacciones ----------

/**
 * Agrega una interacción al historial y, si está pendiente de enviar a la
 * pareja, la encola en la cola de salida (Fase 2).
 */
export async function agregarInteraccion(interaccion) {
  const anterior = await obtener(CLAVES.interacciones, [])
  const lista = [interaccion, ...anterior]
  const guardoInteracciones = await guardar(CLAVES.interacciones, lista)
  if (!guardoInteracciones) return null

  // Si va dirigida a la pareja, se encola para sincronizar luego.
  if (interaccion.receiverId && interaccion.status === 'pendiente_sync') {
    const cola = await obtener(CLAVES.colaSalida, [])
    const guardoCola = await guardar(CLAVES.colaSalida, [...cola, interaccion.id])
    if (!guardoCola) {
      // Evita informar éxito si la operación quedó a medias.
      await guardar(CLAVES.interacciones, anterior)
      return null
    }
  }
  return interaccion
}

/**
 * Migra perfiles de la primera versión, cuyos coupleId/partnerId eran UUID
 * locales sin una vinculación real. Es idempotente: el estado explícito evita
 * repetirla y el perfil se guarda al final para poder reintentar si algo falla.
 */
export async function migrarVinculacionLegada() {
  const perfil = await obtener(CLAVES.perfil, null)
  const esLegado = Boolean(
    perfil?.coupleId &&
    perfil?.partnerId &&
    !Object.prototype.hasOwnProperty.call(perfil, 'estadoVinculacion'),
  )
  if (!esLegado) return { migrado: false, perfil }

  const interacciones = await obtener(CLAVES.interacciones, [])
  const idsLegados = new Set()
  const migradas = interacciones.map((interaccion) => {
    if (interaccion.receiverId !== perfil.partnerId) return interaccion
    idsLegados.add(interaccion.id)
    return {
      ...interaccion,
      coupleId: null,
      receiverId: null,
      status: 'no_enviado_legacy',
    }
  })

  if (idsLegados.size > 0 && !(await guardar(CLAVES.interacciones, migradas))) {
    return { migrado: false, perfil, error: 'error_persistencia' }
  }

  // En un perfil legado toda la cola apuntaba a una pareja ficticia.
  if (!(await guardar(CLAVES.colaSalida, []))) {
    return { migrado: false, perfil, error: 'error_persistencia' }
  }

  const perfilMigrado = {
    ...perfil,
    coupleId: null,
    partnerId: null,
    estadoVinculacion: 'no_vinculada',
  }
  if (!(await guardar(CLAVES.perfil, perfilMigrado))) {
    return { migrado: false, perfil, error: 'error_persistencia' }
  }

  return { migrado: true, perfil: perfilMigrado, interacciones: migradas }
}

/**
 * Lista interacciones aplicando un filtro opcional { type, category, senderId }.
 */
export async function listarInteracciones(filtro = {}) {
  const lista = await obtener(CLAVES.interacciones, [])
  return lista.filter((it) => {
    if (filtro.type && it.type !== filtro.type) return false
    if (filtro.category && it.category !== filtro.category) return false
    if (filtro.senderId && it.senderId !== filtro.senderId) return false
    return true
  })
}

/**
 * Actualiza una interacción existente por id (merge superficial).
 */
export async function actualizarInteraccion(id, cambios) {
  const lista = await obtener(CLAVES.interacciones, [])
  const idx = lista.findIndex((it) => it.id === id)
  if (idx === -1) return null
  lista[idx] = { ...lista[idx], ...cambios }
  await guardar(CLAVES.interacciones, lista)
  return lista[idx]
}

/**
 * Cancela una interacción propia (status funcional 'cancelled', distinto del
 * syncState de la cola offline).
 */
export async function cancelarInteraccion(id) {
  return actualizarInteraccion(id, { status: 'cancelled' })
}

// ---------- Cola de operaciones offline (Fase 2) ----------
//
// Cada operación: { operationId, entity, action, entityId, payload,
// attempts, lastError, createdAt, updatedAt }. No se borra hasta que
// Supabase confirma que la procesó.

export async function agregarOperacion(operacion) {
  const cola = await obtener(CLAVES.colaOperaciones, [])
  const ahora = new Date().toISOString()
  const nueva = {
    operationId: operacion.operationId || generarId(),
    entity: operacion.entity,
    action: operacion.action,
    entityId: operacion.entityId,
    payload: operacion.payload,
    attempts: 0,
    lastError: null,
    createdAt: ahora,
    updatedAt: ahora,
  }
  await guardar(CLAVES.colaOperaciones, [...cola, nueva])
  return nueva
}

export async function listarOperaciones() {
  return obtener(CLAVES.colaOperaciones, [])
}

export async function actualizarOperacion(operationId, cambios) {
  const cola = await obtener(CLAVES.colaOperaciones, [])
  const idx = cola.findIndex((op) => op.operationId === operationId)
  if (idx === -1) return null
  cola[idx] = { ...cola[idx], ...cambios, updatedAt: new Date().toISOString() }
  await guardar(CLAVES.colaOperaciones, cola)
  return cola[idx]
}

export async function eliminarOperacion(operationId) {
  const cola = await obtener(CLAVES.colaOperaciones, [])
  await guardar(CLAVES.colaOperaciones, cola.filter((op) => op.operationId !== operationId))
}

// ---------- Utilidad de IDs (preparado para Fase 2) ----------

/**
 * Genera un UUID v4. Usa crypto.randomUUID si existe (todos los navegadores
 * modernos), con respaldo manual por si acaso.
 */
export function generarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
