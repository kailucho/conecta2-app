// ============================================================
// paraHoy — contenido de la tarjeta única "Para hoy" y frases sugeridas.
//
// La portada muestra UNA sola recomendación que rota de forma determinista por
// día (semilla = día del año), alternando entre misión, tip de fase, pregunta
// de conexión e idea de cita. Nada de esto se persiste: mismo día ⇒ mismo
// contenido, sin estado nuevo.
// ============================================================

import { misionDelDia } from './misiones.js'
import { tipDelDia } from './tiposFase.js'
import {
  IDEAS_CITAS_PRESENCIALES,
  IDEAS_CITAS_VIRTUALES,
} from './ideasCitas.js'

// Preguntas para conversar en pareja (estilo Gottman / 36 preguntas).
export const PREGUNTAS_CONEXION = [
  '¿Qué momento de esta semana te hizo sentir más cerca de mí?',
  '¿Hay algo que te gustaría que hiciéramos más seguido?',
  '¿Qué es lo que más agradeces de nosotros ahora mismo?',
  '¿Cómo te gusta que te cuiden cuando estás bajoneado/a?',
  '¿Qué sueño tuyo te gustaría que apoyara más?',
  '¿Cuál fue la primera vez que sentiste que esto iba en serio?',
  '¿Qué canción te recuerda a nosotros?',
  '¿Qué te hace sentir amado/a sin que diga una palabra?',
  '¿Qué cosa pequeña hago que te gusta y quizás no sabes que noto?',
  '¿Cómo imaginas un domingo perfecto juntos?',
  '¿Qué te gustaría que recordáramos de este año dentro de mucho tiempo?',
  '¿Hay algo que quieras contarme y no has encontrado el momento?',
]

// Frases sugeridas para el mensaje libre, adaptadas por rol de quien escribe.
export const FRASES_SUGERIDAS_BASE = [
  'Solo quería decirte que te amo 💗',
  'Gracias por estar conmigo hoy.',
  'Te extraño y quería que lo supieras.',
  'Estoy orgulloso/a de ti.',
]

export function frasesSugeridas() {
  return FRASES_SUGERIDAS_BASE
}

// Orden de rotación cuando hay fase; sin fase se omite el tip.
const ROTACION_CON_FASE = ['mision', 'tip', 'pregunta', 'cita']
const ROTACION_SIN_FASE = ['mision', 'pregunta', 'cita']

/**
 * Devuelve el contenido de la tarjeta "Para hoy" para un día dado.
 *
 * @param {object} opts
 *   semilla   → índice estable (día del año)
 *   faseId    → fase del ciclo o null
 *   hayDatos  → si hay datos de ciclo
 *   conviven  → si la pareja convive (afecta misión e ideas de cita)
 * @returns { tipo, titulo, texto, accion } donde accion ∈
 *   'completar' | 'enviar_pregunta' | 'proponer' | null
 */
export function contenidoParaHoy({ semilla = 0, faseId, hayDatos, conviven } = {}) {
  const usarFase = hayDatos && !!faseId
  const rotacion = usarFase ? ROTACION_CON_FASE : ROTACION_SIN_FASE
  const tipo = rotacion[Math.abs(semilla) % rotacion.length]

  if (tipo === 'mision') {
    const m = misionDelDia(conviven, semilla)
    return {
      tipo,
      titulo: `🎯 ${m.titulo}`,
      texto: m.texto,
      accion: 'completar',
      puntos: m.puntos,
    }
  }

  if (tipo === 'tip') {
    return {
      tipo,
      titulo: '💡 Tip del día',
      texto: tipDelDia(faseId, semilla),
      accion: null,
    }
  }

  if (tipo === 'pregunta') {
    const idx = Math.abs(semilla) % PREGUNTAS_CONEXION.length
    return {
      tipo,
      titulo: '💬 Pregunta para hoy',
      texto: PREGUNTAS_CONEXION[idx],
      accion: 'enviar_pregunta',
    }
  }

  // cita
  const lista = conviven ? IDEAS_CITAS_PRESENCIALES : IDEAS_CITAS_VIRTUALES
  const idea = lista[Math.abs(semilla) % lista.length]
  return {
    tipo,
    titulo: '🌹 Idea para los dos',
    texto: `${idea.emoji} ${idea.texto}`,
    accion: 'proponer',
  }
}
