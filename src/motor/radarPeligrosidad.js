// ============================================================
// radarPeligrosidad — motor del RADAR DE PELIGROSIDAD (modo él).
//
// "Del día, no de ella 😅": combina señales disponibles sin afirmar que el
// ciclo determina el estado emocional de la pareja. Prioridad de factores:
//   1. Estado declarado explícitamente por la pareja (alerta_estado activa).
//   2. Ánimo positivo compartido hoy por la pareja (animo).
//   3. Información del ciclo, únicamente cuando la privacidad lo permita.
//   4. Valor neutral cuando no hay suficientes señales.
//
// Es una guía con humor, NO un diagnóstico ni un juicio sobre la pareja.
// ============================================================

import { estaExpirado } from './fechas.js'

export const SCORE_NEUTRAL = 5

/** Niveles del radar, única fuente de verdad para el rango 0-10. */
export const NIVELES_RADAR = [
  { min: 0, max: 2, id: 'tranquilo', estado: 'Terreno tranquilo', emoji: '🟢', idea: 'Buen momento para proponer planes.' },
  { min: 3, max: 4, id: 'antenas', estado: 'Antenas arriba', emoji: '🟡', idea: 'Escucha antes de improvisar.' },
  { min: 5, max: 6, id: 'mimos', estado: 'Mimos recomendados', emoji: '🟠', idea: 'Ten listo cariño, paciencia o un snack.' },
  { min: 7, max: 8, id: 'delicada', estado: 'Zona delicada', emoji: '🔴', idea: 'Hoy no es día para comentarios innecesarios.' },
  { min: 9, max: 10, id: 'legendario', estado: 'Modo legendario', emoji: '☢️', idea: 'Máxima ternura y cero discusiones tontas.' },
]

/** Ajustes de puntaje por alerta de estado declarada (moderados, no acumulativos). */
const AJUSTE_ALERTA = {
  irritable: 2,
  sensible: 1,
  sin_bateria: 1,
  estresado: 1,
  cueva: 1,
}

/** Ajustes de puntaje por ánimo positivo compartido hoy. */
const AJUSTE_ANIMO = {
  '😄': -2,
  '🥰': -1,
}

/** Accesorios de Astro Azul según el rango de score. */
const ACCESORIOS_POR_NIVEL = {
  tranquilo: ['lentes'],
  antenas: ['antena'],
  mimos: ['kit_cuidado'],
  delicada: ['casco', 'escudo'],
  legendario: ['casco', 'escudo', 'detalle_carinoso'],
}

/** Devuelve el nivel del radar (0-10) según el score. */
export function nivelPorScore(score) {
  const s = Math.max(0, Math.min(10, Math.round(score)))
  return NIVELES_RADAR.find((n) => s >= n.min && s <= n.max) || NIVELES_RADAR[0]
}

function esMismoDia(isoA, isoB) {
  if (!isoA || !isoB) return false
  return new Date(isoA).toDateString() === new Date(isoB).toDateString()
}

/**
 * Encuentra la alerta de estado más reciente, activa y entrante (enviada por
 * la pareja al usuario). No acumula varias alertas antiguas.
 */
function alertaActivaMasReciente(interacciones, userId, partnerId) {
  return interacciones
    .filter(
      (it) =>
        it.type === 'alerta_estado' &&
        it.receiverId === userId &&
        it.senderId === partnerId &&
        it.status !== 'cancelled' &&
        it.status !== 'acknowledged' &&
        !estaExpirado(it.expiresAt),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
}

/** Encuentra un ánimo positivo compartido hoy por la pareja (entrante). */
function animoPositivoDeHoy(interacciones, userId, partnerId, fechaActual) {
  return interacciones
    .filter(
      (it) =>
        it.type === 'animo' &&
        it.receiverId === userId &&
        it.senderId === partnerId &&
        AJUSTE_ANIMO[it.actionId] !== undefined &&
        esMismoDia(it.createdAt, fechaActual),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
}

/**
 * Calcula el radar de peligrosidad combinando señales disponibles.
 *
 * @param {object} params
 * @param {number|null} params.scoreCiclo - score 0-10 derivado de la fase (o null).
 * @param {Array} params.interacciones - interacciones locales (enviadas/recibidas).
 * @param {string} params.userId - id de quien ve el radar (modo él).
 * @param {string} params.partnerId - id de la pareja.
 * @param {string} params.privacidadHormonal - 'todo' | 'solo_fases' | 'solo_alertas'.
 * @param {Date|string} params.fechaActual - fecha de referencia (por defecto hoy).
 * @returns {{score:number, nivel:object, factores:string[], mostrarFase:boolean, accesorios:string[]}}
 */
export function calcularRadarPeligrosidad({
  scoreCiclo = null,
  interacciones = [],
  userId = null,
  partnerId = null,
  privacidadHormonal = 'todo',
  fechaActual = new Date(),
} = {}) {
  const factores = []
  const soloAlertas = privacidadHormonal === 'solo_alertas'
  const permiteCiclo = !soloAlertas && scoreCiclo != null

  let score = permiteCiclo ? scoreCiclo : SCORE_NEUTRAL
  if (permiteCiclo) factores.push('ciclo')

  const alerta = alertaActivaMasReciente(interacciones, userId, partnerId)
  if (alerta && AJUSTE_ALERTA[alerta.actionId] !== undefined) {
    score += AJUSTE_ALERTA[alerta.actionId]
    factores.push(`alerta:${alerta.actionId}`)
  }

  const animo = animoPositivoDeHoy(interacciones, userId, partnerId, fechaActual)
  if (animo) {
    score += AJUSTE_ANIMO[animo.actionId]
    factores.push(`animo:${animo.actionId}`)
  }

  const scoreFinal = Math.max(0, Math.min(10, Math.round(score)))
  const nivel = nivelPorScore(scoreFinal)

  return {
    score: scoreFinal,
    nivel,
    factores,
    // La fase solo puede mostrarse cuando la privacidad lo permite y el
    // ciclo realmente participó del cálculo (nunca en solo_alertas).
    mostrarFase: permiteCiclo,
    accesorios: ACCESORIOS_POR_NIVEL[nivel.id] || [],
    hayInsumos: factores.length > 0,
  }
}
