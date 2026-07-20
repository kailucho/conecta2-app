// ============================================================
// radarPeligrosidad (datos) — mensajes del RADAR DE PELIGROSIDAD por tono de
// humor. "Del día, no de ella 😅": guía con humor, nunca un juicio sobre la
// pareja, su personalidad o la menstruación.
//
// Reglas de contenido (no negociables):
//   - Nunca presentar la menstruación como irracionalidad.
//   - Nunca decir que "las mujeres son imposibles de entender".
//   - Nunca ridiculizar emociones reales.
//   - Nunca recomendar manipular, ignorar o invalidar a la pareja.
//   - Nunca normalizar el miedo dentro de la relación.
// ============================================================

const MENSAJES = {
  tranquilo: {
    suave: [
      'Hoy el ambiente está en calma. Buen momento para un detalle lindo.',
      'Todo tranquilo. Aprovecha para conectar con calma.',
    ],
    normal: [
      'Vía libre. Buen día para proponer un plan.',
      'Terreno despejado: es un buen momento para salir o conversar.',
    ],
    sinfiltro: [
      'Cero alertas. Aprovecha antes de que cambie el clima 😏',
      'Todo en calma. No lo arruines con una idea rara.',
    ],
  },
  antenas: {
    suave: [
      'Un pequeño detalle puede hacer una gran diferencia hoy.',
      'Escucha con calma antes de improvisar algo grande.',
    ],
    normal: [
      'Antenas arriba: escucha antes de lanzar un plan improvisado.',
      'Nada grave, solo presta un poco más de atención hoy.',
    ],
    sinfiltro: [
      'Nada serio, pero activa el radar antes de opinar de más.',
      'Todo bien, solo no actives el modo genio sin preguntar primero.',
    ],
  },
  mimos: {
    suave: [
      'Un abrazo, un té o un buen silencio pueden ayudar mucho hoy.',
      'Pregunta qué necesita antes de asumir. El cariño extra siempre suma.',
    ],
    normal: [
      'Kit recomendado: paciencia, atención y algo rico para picar.',
      'Misión del día: detectar el antojo antes de que sea comunicado.',
    ],
    sinfiltro: [
      'Ten listo el snack de emergencia. Es una orden amistosa.',
      'Hoy rinde más un abrazo que un argumento. Actúa en consecuencia.',
    ],
  },
  delicada: {
    suave: [
      'Hoy toca escuchar con calma y sin apuro.',
      'Un poco más de ternura de lo normal le vendría bien.',
    ],
    normal: [
      'Antes de responder: respira, escucha y recién procesa.',
      'Hoy no es el mejor día para bromas pesadas ni comentarios de más.',
    ],
    sinfiltro: [
      'No necesitas una solución. Repetimos: no necesitas una solución.',
      'Hoy puedes hablar, pero primero activa el sentido común.',
    ],
  },
  legendario: {
    suave: [
      'Hoy el foco es la ternura, la calma y el acompañamiento.',
      'Un poco de paciencia extra hace toda la diferencia hoy.',
    ],
    normal: [
      'Modo legendario: máxima ternura, cero discusiones tontas.',
      'Hoy el trofeo es la calma. Ve por él.',
    ],
    sinfiltro: [
      'Cero discusiones tontas. El radar ya hizo su parte.',
      'Nivel máximo: mucha ternura, cero comentarios innecesarios.',
    ],
  },
}

const ACLARACION =
  'Guía con humor para acompañar mejor, no un diagnóstico ni un juicio sobre tu pareja.'

/**
 * Selección determinista por día (no cambia en cada render) del mensaje del
 * nivel dado, según el tono de humor configurado.
 */
export function mensajeRadar(nivelId, tono = 'normal', semilla = 0) {
  const porNivel = MENSAJES[nivelId] || MENSAJES.mimos
  const lista = porNivel[tono] || porNivel.normal
  const indice = Math.abs(semilla) % lista.length
  return lista[indice]
}

export function aclaracionRadar() {
  return ACLARACION
}

export { MENSAJES }
