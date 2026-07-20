// ============================================================
// ideasCitas — ideas para la cita semanal. Incluye ideas de Arequipa, Perú,
// y citas virtuales para novios que no conviven.
// ============================================================

export const IDEAS_CITAS_PRESENCIALES = [
  { emoji: '🍲', texto: 'Almuerzo en una picantería (rocoto relleno, adobo, chupe).' },
  { emoji: '🌸', texto: 'Caminata por el mirador de Yanahuara al atardecer.' },
  { emoji: '🌄', texto: 'Escapada a la campiña arequipeña a respirar y desconectar.' },
  { emoji: '☕', texto: 'Café con queque en el Centro Histórico y conversar sin celular.' },
  { emoji: '🏛️', texto: 'Recorrer el Monasterio de Santa Catalina como turistas en su ciudad.' },
  { emoji: '🍺', texto: 'Anticuchos y una chela en la noche, sin apuro.' },
  { emoji: '🎬', texto: 'Peli en casa con mantita, popcorn y cero pantallas de trabajo.' },
  { emoji: '🍦', texto: 'Queso helado en la Plaza de Armas y caminar agarrados de la mano.' },
  { emoji: '🥾', texto: 'Un día de aventura: Sabandía, molino y campo.' },
  { emoji: '🌮', texto: 'Cocinar juntos una receta nueva en casa.' },
  { emoji: '🎨', texto: 'Feria, museo o exposición local que ninguno haya visto.' },
  { emoji: '🌃', texto: 'Mirar el Misti de noche desde una azotea con música suave.' },
]

export const IDEAS_CITAS_VIRTUALES = [
  { emoji: '🎬', texto: 'Ver la misma peli a la vez por videollamada.' },
  { emoji: '🍕', texto: 'Cita de comida: cada uno pide lo mismo y cenan juntos en video.' },
  { emoji: '🎮', texto: 'Jugar algo online los dos (un juego cooperativo o trivia).' },
  { emoji: '📖', texto: 'Leerse un ratito o compartir playlist mientras conversan.' },
  { emoji: '🌅', texto: 'Videollamada al despertar o antes de dormir, solo para verse.' },
  { emoji: '❓', texto: 'Juego de preguntas para conocerse más (36 preguntas del amor).' },
  { emoji: '✍️', texto: 'Escribirse una carta y leérsela por video.' },
  { emoji: '🗺️', texto: 'Planear juntos el próximo viaje o la próxima vez que se vean.' },
]

/**
 * Idea de cita "de la semana", según si conviven o no, estable por semana.
 */
export function ideaCitaSemana(conviven, semilla = 0) {
  const lista = conviven ? IDEAS_CITAS_PRESENCIALES : IDEAS_CITAS_VIRTUALES
  return lista[Math.abs(semilla) % lista.length]
}

// Las 3 preguntas del termómetro de conexión semanal.
export const PREGUNTAS_TERMOMETRO = [
  '¿Se rieron juntos esta semana?',
  '¿Tuvieron un momento de calidad sin celular ni pendientes?',
  '¿Se sintieron escuchados el uno por el otro?',
]
