// ============================================================
// pronosticoPareja — motor de PRONÓSTICO EMOCIONAL Y DE BIENESTAR.
//
// No duplica lógica: reutiliza motorCiclo (fase/día/score), radarPeligrosidad
// (combinación de señales + niveles), expresiones (personaje) y datos de
// fases/alertas/etapas de vida ya existentes.
//
// Prioridad de fuentes para HOY:
//   1. Estado real declarado por la persona (alerta_estado / animo propios).
//   2. Alertas activas compartidas por la pareja.
//   3. Ánimo compartido hoy.
//   4. Datos recientes relevantes.
//   5. Fase del ciclo, solo si la privacidad lo permite.
//   6. Pronóstico neutral cuando no hay datos.
//
// Para fechas futuras NUNCA se inventa un estado emocional: solo se proyectan
// señales proyectables (fase, si la privacidad lo permite) con lenguaje
// probabilístico y confianza reducida en ciclos irregulares/variables. No se
// proyecta una alerta puntual de hoy hacia el resto de la semana.
//
// IMPORTANTE (no negociable): esto NO es un diagnóstico médico. La fase
// "puede influir" / "coincide con", nunca "causa" una emoción.
// ============================================================

import {
  obtenerFase,
  diaCicloProyectado,
  scorePeligrosidad,
  esZonaRoja,
} from './motorCiclo.js'
import { calcularRadarPeligrosidad, nivelPorScore, SCORE_NEUTRAL } from './radarPeligrosidad.js'
import { expresionActual } from './expresiones.js'
import { claveDia, diasEntre } from './fechas.js'
import { fraseCabecera } from '../datos/tiposFase.js'
import { alertaPorId } from '../datos/alertasEstado.js'

const ACCESORIOS_POR_NIVEL = {
  tranquilo: ['lentes'],
  antenas: ['antena'],
  mimos: ['kit_cuidado'],
  delicada: ['casco', 'escudo'],
  legendario: ['casco', 'escudo', 'detalle_carinoso'],
}

function esMismoDia(isoA, fecha) {
  if (!isoA) return false
  return claveDia(isoA) === claveDia(fecha)
}

/** Estado real vigente declarado por la propia persona hoy (alerta o ánimo propio). */
function estadoRealDeclarado(interacciones, userId, fecha) {
  return (
    interacciones
      .filter(
        (it) =>
          it.senderId === userId &&
          (it.type === 'alerta_estado' || it.type === 'animo') &&
          it.status !== 'cancelled' &&
          esMismoDia(it.createdAt, fecha),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
  )
}

/**
 * Pronóstico para UNA fecha. Para "hoy" usa toda la prioridad de fuentes
 * (incluyendo estado real); para fechas futuras solo proyecta señales
 * proyectables (fase), nunca alertas puntuales de hoy.
 *
 * @param {Date|string} fecha
 * @param {object} ctx
 *   ciclo, interacciones, userId, partnerId, privacidadHormonal, hoy, esHoy
 */
export function pronosticoDelDia(fecha, ctx = {}) {
  const {
    ciclo = {},
    interacciones = [],
    userId = null,
    partnerId = null,
    privacidadHormonal = 'todo',
    hoy = new Date(),
  } = ctx

  const esHoy = claveDia(fecha) === claveDia(hoy)
  const menopausia = ciclo.etapaVida === 'menopausia'
  const fechaUltima = ctx.fechaUltimaRegla ?? null
  const hayDatosCiclo = !!fechaUltima && !menopausia

  const señales = []
  let scoreCiclo = null
  let fase = null
  let diaCiclo = null

  if (hayDatosCiclo) {
    diaCiclo = diaCicloProyectado(fecha, fechaUltima, ciclo)
    fase = obtenerFase(diaCiclo, ciclo)
    scoreCiclo = scorePeligrosidad(diaCiclo, ciclo)
  }

  // Estado real (solo aplica y manda cuando la fecha consultada es HOY).
  const estadoReal = esHoy ? estadoRealDeclarado(interacciones, userId, fecha) : null

  const radar = calcularRadarPeligrosidad({
    scoreCiclo,
    interacciones: esHoy ? interacciones : [], // no proyectar alertas de hoy hacia el futuro
    userId,
    partnerId,
    privacidadHormonal,
    fechaActual: fecha,
  })

  let score = radar.score
  let confianza = 'media'

  if (estadoReal) {
    señales.push('estado_real')
    if (estadoReal.type === 'alerta_estado' && alertaPorId(estadoReal.actionId)) {
      // El estado real declarado manda: sube/ajusta directamente el score.
      score = Math.min(10, Math.max(radar.score, 7))
    }
    confianza = 'alta'
  } else if (radar.factores.some((f) => f.startsWith('alerta') || f.startsWith('animo'))) {
    señales.push(...radar.factores)
    confianza = 'alta'
  } else if (radar.mostrarFase) {
    señales.push('ciclo')
    confianza = ciclo.confiable === false ? 'baja' : 'media'
  } else {
    confianza = hayDatosCiclo || estadoReal ? confianza : 'sin_datos'
  }

  // Fechas futuras: nunca "alta" por alertas puntuales; reduce a media/baja.
  if (!esHoy) {
    señales.length = 0
    if (radar.mostrarFase && hayDatosCiclo) {
      señales.push('ciclo_proyectado')
      confianza = ciclo.confiable === false ? 'baja' : 'media'
    } else {
      confianza = 'sin_datos'
    }
  }

  const hayInsumos = hayDatosCiclo || estadoReal || radar.hayInsumos
  if (!hayInsumos) {
    confianza = 'sin_datos'
    score = SCORE_NEUTRAL
  }

  const nivel = nivelPorScore(score)
  const zonaRoja = hayDatosCiclo ? esZonaRoja(diaCiclo, ciclo) : false

  return {
    fecha: claveDia(fecha),
    diaCiclo,
    fase: radar.mostrarFase ? fase : null,
    nivel: score,
    nivelId: nivel.id,
    nivelTextual: nivel.estado,
    clima: climaPorNivel(nivel.id),
    energia: energiaPorNivel(nivel.id),
    sensibilidad: sensibilidadPorNivel(nivel.id),
    molestias: zonaRoja ? ['cólicos posibles', 'cansancio'] : [],
    recomendacionPareja: nivel.idea,
    recomendacionAutocuidado: fase ? fraseCabecera(fase.id, ctx.tono || 'normal') : 'Escúchate y date espacio hoy.',
    confianza: hayInsumos ? confianza : 'sin_datos',
    señales,
    mostrarFase: radar.mostrarFase,
    hayEstadoReal: !!estadoReal,
    mensajeNotificacion: mensajeNotificacion(nivel, esHoy),
    expresion: expresionActual({
      estadoManual: estadoReal?.actionId || null,
      faseId: fase?.id || null,
    }),
    accesorios: ACCESORIOS_POR_NIVEL[nivel.id] || [],
  }
}

// Ícono "meteorológico" del pronóstico (distinto del semáforo del radar),
// para la metáfora de app del clima en la UI.
export function climaPorNivel(nivelId) {
  return {
    tranquilo: '☀️',
    antenas: '🌤️',
    mimos: '⛅',
    delicada: '🌧️',
    legendario: '⛈️',
  }[nivelId] || '⛅'
}

function energiaPorNivel(nivelId) {
  return { tranquilo: 'alta', antenas: 'media-alta', mimos: 'media', delicada: 'baja', legendario: 'muy baja' }[nivelId] || 'media'
}

function sensibilidadPorNivel(nivelId) {
  return { tranquilo: 'baja', antenas: 'media', mimos: 'media-alta', delicada: 'alta', legendario: 'muy alta' }[nivelId] || 'media'
}

function mensajeNotificacion(nivel, esHoy) {
  const prefijo = esHoy ? 'Hoy' : 'Podría'
  return `${nivel.emoji} ${prefijo}: ${nivel.estado.toLowerCase()} (${nivel.min}-${nivel.max}/10).`
}

/**
 * Pronóstico de los próximos N días (por defecto 7, incluyendo hoy).
 */
export function pronosticoSemana(fechaInicio, ctx = {}, dias = 7) {
  const salida = []
  const base = new Date(fechaInicio)
  base.setHours(0, 0, 0, 0)
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(base)
    fecha.setDate(fecha.getDate() + i)
    salida.push(pronosticoDelDia(fecha, { ...ctx, hoy: ctx.hoy || fechaInicio }))
  }
  return salida
}

export { diasEntre }
