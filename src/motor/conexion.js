// ============================================================
// conexion — "ratio 5:1 invisible" de Gottman. Se calcula a partir de la
// valencia de las interacciones (positivas vs negativas). El NÚMERO NUNCA se
// muestra: se traduce en el brillo de las mascotas y del bloque "Conexión de
// hoy", y en si el cielo de fondo está despejado o nublado.
//
// Regla: jamás culpar. Si el balance está bajo, se sugiere suavemente sumar un
// detalle, nunca se dice "fallaste" ni "tu pareja no hizo suficiente".
// ============================================================

import { claveDia } from './fechas.js'

/**
 * Balance de valencias de los últimos `dias` días.
 * @returns { positivas, negativas, ratio, brillo(0..1), nublado(bool) }
 */
export function balanceReciente(interacciones = [], dias = 7) {
  const limite = Date.now() - dias * 86400000
  let positivas = 0
  let negativas = 0
  for (const it of interacciones) {
    const t = new Date(it.createdAt).getTime()
    if (t < limite) continue
    if (it.valencia > 0) positivas += 1
    else if (it.valencia < 0) negativas += 1
  }
  // Ratio Gottman ideal ~5:1. Normalizamos a un brillo 0..1.
  const ratio = negativas === 0 ? positivas : positivas / negativas
  // brillo: 0 (apagado) .. 1 (radiante). 5:1 o mejor => lleno.
  let brillo
  if (positivas + negativas === 0) brillo = 0.6 // neutro al inicio
  else brillo = Math.max(0.15, Math.min(1, ratio / 5))

  return {
    positivas,
    negativas,
    ratio,
    brillo,
    // Se nubla si hubo más negativas que su quinta parte de positivas.
    nublado: negativas > 0 && ratio < 3,
  }
}

/**
 * Conteo de momentos positivos de HOY (para el bloque "Conexión de hoy").
 */
export function conexionHoy(interacciones = []) {
  const hoy = claveDia(new Date())
  return interacciones.filter(
    (it) => it.valencia > 0 && claveDia(new Date(it.createdAt)) === hoy,
  ).length
}

// Mensajes SIEMPRE positivos para el bloque "Conexión de hoy".
const MENSAJES_CONEXION = [
  'Ese pequeño detalle sí cuenta 💫',
  'Hoy estuvieron conectados 💙',
  'Su conexión está creciendo 🌱',
  'Buen trabajo escuchándose 👂',
  'Cada gesto suma un montón 💗',
]

/**
 * Mensaje motivador según el nivel de conexión de hoy (nunca culpa).
 */
export function mensajeConexion(nivelHoy, brillo) {
  if (nivelHoy === 0 && brillo < 0.5) {
    return 'Un detalle hoy sumaría un montón 💛'
  }
  return MENSAJES_CONEXION[Math.min(nivelHoy, MENSAJES_CONEXION.length - 1)]
}
