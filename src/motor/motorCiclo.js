// ============================================================
// motorCiclo — lógica pura del ciclo menstrual (sin React, 100% testeable).
//
// Modelo de fases (para un ciclo estándar de 28 días):
//   Menstrual: días 1..duracionRegla            (default 1-5)
//   Folicular: (duracionRegla+1)..(ovulacion-1) (default 6-13)
//   Ovulación: ovulacion..(ovulacion+2)         (default 14-16)
//   Lútea:     (ovulacion+3)..duracionCiclo      (default 17-28)
//   Zona Roja: últimos 5 días del ciclo          (default 24-28)
//
// El día de ovulación se ancla a la fase lútea constante (~14 días):
//   ovulacionDia = duracionCiclo - 14   → 14 en un ciclo de 28.
// Así las fases escalan de forma coherente en ciclos más cortos o largos.
//
// IMPORTANTE (privacidad y respeto): este motor solo calcula fases y fechas.
// La UI NUNCA debe afirmar que una emoción está causada obligatoriamente por
// las hormonas — la fase solo "puede influir" / "coincide con".
// ============================================================

import { diasEntre, sumarDias, aMedianoche, esFechaISOValida } from './fechas.js'

export const FASES = {
  menstrual: {
    id: 'menstrual',
    nombre: 'Menstrual',
    emoji: '🩸',
    color: 'var(--tema-danger)',
  },
  folicular: {
    id: 'folicular',
    nombre: 'Folicular',
    emoji: '🌱',
    color: 'var(--tema-success)',
  },
  ovulacion: {
    id: 'ovulacion',
    nombre: 'Ovulación',
    emoji: '✨',
    color: 'var(--tema-acento)',
  },
  lutea: {
    id: 'lutea',
    nombre: 'Lútea',
    emoji: '🌙',
    color: 'var(--tema-warning)',
  },
}

/**
 * Normaliza la config de ciclo con valores por defecto sanos.
 */
function normalizar(config = {}) {
  const duracionCiclo = Math.max(20, Math.min(45, config.duracionCiclo || 28))
  const duracionRegla = Math.max(2, Math.min(10, config.duracionRegla || 5))
  return { duracionCiclo, duracionRegla }
}

/**
 * Día de ovulación (1-based) dentro del ciclo.
 */
export function diaOvulacion(config) {
  const { duracionCiclo } = normalizar(config)
  // Fase lútea constante de ~14 días. Nunca antes del día 10.
  return Math.max(10, duracionCiclo - 14)
}

/**
 * Límites (día inicio/fin) de cada fase para una config dada.
 */
export function limitesFases(config) {
  const { duracionCiclo, duracionRegla } = normalizar(config)
  const ovu = diaOvulacion(config)
  return {
    menstrual: [1, duracionRegla],
    folicular: [duracionRegla + 1, ovu - 1],
    ovulacion: [ovu, ovu + 2],
    lutea: [ovu + 3, duracionCiclo],
  }
}

/**
 * Día del ciclo (1-based) para HOY respecto a la última regla. NO envuelve:
 * si hay retraso, devuelve un número mayor a duracionCiclo (día real).
 */
export function calcularDiaCiclo(fechaUltimaRegla, hoy = new Date()) {
  if (!fechaUltimaRegla) return 1
  const d = diasEntre(fechaUltimaRegla, hoy)
  return d < 0 ? 1 : d + 1
}

/**
 * Día del ciclo PROYECTADO para cualquier fecha (pasada o futura), envolviendo
 * con el largo del ciclo. Se usa en el calendario para pintar meses completos.
 */
export function diaCicloProyectado(fecha, fechaUltimaRegla, config) {
  const { duracionCiclo } = normalizar(config)
  const d = diasEntre(fechaUltimaRegla, fecha)
  const mod = ((d % duracionCiclo) + duracionCiclo) % duracionCiclo
  return mod + 1
}

/**
 * Fase correspondiente a un día del ciclo. Si el día supera el largo del ciclo
 * (retraso), se mantiene en lútea y se marca `retraso: true`.
 */
export function obtenerFase(dia, config) {
  const { duracionCiclo, duracionRegla } = normalizar(config)
  const ovu = diaOvulacion(config)

  let faseId
  let retraso = false

  if (dia > duracionCiclo) {
    faseId = 'lutea'
    retraso = true
  } else if (dia <= duracionRegla) {
    faseId = 'menstrual'
  } else if (dia < ovu) {
    faseId = 'folicular'
  } else if (dia <= ovu + 2) {
    faseId = 'ovulacion'
  } else {
    faseId = 'lutea'
  }

  return { ...FASES[faseId], dia, retraso }
}

/**
 * ¿El día está en Zona Roja (últimos 5 días del ciclo)?
 * En retraso también cuenta como Zona Roja (siguen los días premenstruales).
 */
export function esZonaRoja(dia, config) {
  const { duracionCiclo } = normalizar(config)
  if (dia > duracionCiclo) return true
  return dia >= duracionCiclo - 4 && dia <= duracionCiclo
}

/**
 * Ventana fértil: 5 días antes de la ovulación + el día de ovulación.
 * Devuelve { inicio, fin } en días del ciclo.
 */
export function ventanaFertil(config) {
  const ovu = diaOvulacion(config)
  return { inicio: Math.max(1, ovu - 5), fin: ovu }
}

/**
 * ¿El día está dentro de la ventana fértil?
 */
export function esDiaFertil(dia, config) {
  const { inicio, fin } = ventanaFertil(config)
  return dia >= inicio && dia <= fin
}

/**
 * Recalcula el promedio real del ciclo y su variabilidad a partir de los
 * registros de inicio de regla. Necesita al menos 2 registros para medir.
 *
 * @returns { promedioReal, variabilidad, confiable, cantidadCiclos }
 */
export function recalcularPromedio(registrosRegla = []) {
  const fechas = registrosRegla
    .map((r) => {
      if (!r.fechaInicio) return null
      if (typeof r.fechaInicio === 'string' && !esFechaISOValida(r.fechaInicio)) return null
      const fecha = aMedianoche(r.fechaInicio)
      return Number.isNaN(fecha.getTime()) ? null : fecha
    })
    .filter((fecha) => fecha !== null)
    .sort((a, b) => a - b)

  if (fechas.length < 2) {
    return {
      promedioReal: 28,
      variabilidad: 0,
      confiable: true,
      cantidadCiclos: Math.max(0, fechas.length - 1),
    }
  }

  const gaps = []
  for (let i = 1; i < fechas.length; i++) {
    gaps.push(diasEntre(fechas[i - 1], fechas[i]))
  }

  const promedioReal = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
  const variabilidad = Math.max(...gaps) - Math.min(...gaps)

  return {
    promedioReal,
    variabilidad,
    // Si varía más de 7 días entre ciclos, baja confiabilidad.
    confiable: variabilidad <= 7,
    cantidadCiclos: gaps.length,
  }
}

/**
 * Predice las próximas N reglas y sus ovulaciones a partir de la última regla.
 *
 * @returns [{ inicioRegla: Date, ovulacion: Date }]
 */
export function predecirProximas(fechaUltimaRegla, config, cuantas = 2) {
  if (!fechaUltimaRegla) return []
  const { duracionCiclo } = normalizar(config)
  // Usa el promedio real si existe y es razonable; si no, el largo configurado.
  const largo =
    config.promedioReal && config.promedioReal >= 20 && config.promedioReal <= 45
      ? config.promedioReal
      : duracionCiclo
  const ovuOffset = diaOvulacion(config) - 1

  const salida = []
  let inicio = aMedianoche(fechaUltimaRegla)
  for (let i = 0; i < cuantas; i++) {
    inicio = sumarDias(inicio, largo)
    salida.push({
      inicioRegla: new Date(inicio),
      ovulacion: sumarDias(inicio, ovuOffset),
    })
  }
  return salida
}

/**
 * Puntaje 0-10 para el velocímetro ("peligrosidad" en modo él) o para modular
 * el Clima Interno (modo ella). Alto cerca de la regla y en Zona Roja; bajo en
 * folicular. Es una guía con humor, NO un diagnóstico.
 */
export function scorePeligrosidad(dia, config) {
  const fase = obtenerFase(dia, config)
  if (esZonaRoja(dia, config)) return 9
  const base = {
    menstrual: 7,
    folicular: 2,
    ovulacion: 3,
    lutea: 5,
  }[fase.id]
  return base
}
