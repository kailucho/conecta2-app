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
  const lista = await obtener(CLAVES.interacciones, [])
  lista.unshift(interaccion)
  await guardar(CLAVES.interacciones, lista)

  // Si va dirigida a la pareja, se encola para sincronizar luego.
  if (interaccion.receiverId && interaccion.status === 'pendiente_sync') {
    const cola = await obtener(CLAVES.colaSalida, [])
    cola.push(interaccion.id)
    await guardar(CLAVES.colaSalida, cola)
  }
  return interaccion
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
