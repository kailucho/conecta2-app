// ============================================================
// expresiones — decide qué expresión muestra el personaje.
//
// Prioridad (de mayor a menor):
//   1) estado declarado manualmente (alerta de estado activa)
//   2) interacción reciente (reacción a una acción rápida / respuesta)
//   3) fase del ciclo (modula suavemente, NUNCA de forma determinista)
//   4) neutral
//
// Importante: la fase solo modula la expresión "de base". Nunca se afirma que
// una emoción está causada por hormonas; Estrellita en fase lútea se ve
// "sensible/tranquila", jamás "molesta" o "agresiva" por defecto.
// ============================================================

export const EXPRESIONES = {
  neutral: 'neutral',
  feliz: 'feliz',
  radiante: 'radiante',
  tierno: 'tierno',
  cansado: 'cansado',
  sensible: 'sensible',
  cueva: 'cueva',
  sorpresa: 'sorpresa',
  amor: 'amor',
  pensativo: 'pensativo',
}

// Expresión base por fase (Estrellita y Astro comparten el mapa; cada SVG
// la interpreta a su manera).
const BASE_POR_FASE = {
  menstrual: EXPRESIONES.cansado,
  folicular: EXPRESIONES.feliz,
  ovulacion: EXPRESIONES.radiante,
  lutea: EXPRESIONES.sensible,
}

// Traduce un estado emocional declarado a una expresión.
const EXPRESION_POR_ESTADO = {
  irritable: EXPRESIONES.sensible,
  cueva: EXPRESIONES.cueva,
  sensible: EXPRESIONES.sensible,
  sin_bateria: EXPRESIONES.cansado,
  estresado: EXPRESIONES.pensativo,
}

// Traduce el tipo de acción rápida a una reacción inmediata del personaje.
const EXPRESION_POR_ACCION = {
  hambre: EXPRESIONES.pensativo,
  engreir: EXPRESIONES.tierno,
  abrazo: EXPRESIONES.tierno,
  extrano: EXPRESIONES.amor,
  besitos: EXPRESIONES.amor,
  antojo: EXPRESIONES.pensativo,
  sin_energia: EXPRESIONES.cansado,
  estresado: EXPRESIONES.pensativo,
  momento: EXPRESIONES.pensativo,
  buena_noticia: EXPRESIONES.sorpresa,
  ganas_verte: EXPRESIONES.amor,
  meti_pata: EXPRESIONES.pensativo,
  // Gestos y planes añadidos con el centro de interacciones.
  corazon: EXPRESIONES.amor,
  cita: EXPRESIONES.amor,
  pelicula: EXPRESIONES.feliz,
  salir_comer: EXPRESIONES.feliz,
  pregunta_conexion: EXPRESIONES.pensativo,
}

/**
 * Calcula la expresión actual del personaje.
 *
 * @param {object} opts
 *   estadoManual  → id de alerta de estado activa (o null)
 *   accionReciente→ actionId de una acción rápida reciente (o null)
 *   faseId        → fase del ciclo (o null)
 */
export function expresionActual({ estadoManual, accionReciente, faseId } = {}) {
  if (estadoManual && EXPRESION_POR_ESTADO[estadoManual]) {
    return EXPRESION_POR_ESTADO[estadoManual]
  }
  if (accionReciente && EXPRESION_POR_ACCION[accionReciente]) {
    return EXPRESION_POR_ACCION[accionReciente]
  }
  if (faseId && BASE_POR_FASE[faseId]) {
    return BASE_POR_FASE[faseId]
  }
  return EXPRESIONES.neutral
}

/**
 * Expresión base solo por fase (para vistas informativas de la Guía).
 */
export function expresionPorFase(faseId) {
  return BASE_POR_FASE[faseId] || EXPRESIONES.neutral
}

/**
 * Expresión de reacción para una acción/gesto concreto (o null si no hay).
 * La usa el personaje interactivo para reaccionar a lo que se envía.
 */
export function expresionPorAccion(actionId) {
  return EXPRESION_POR_ACCION[actionId] || null
}

/**
 * Expresión de reacción para un estado emocional declarado (o null si no hay).
 */
export function expresionPorEstado(estadoId) {
  return EXPRESION_POR_ESTADO[estadoId] || null
}
