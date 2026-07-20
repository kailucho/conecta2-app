// ============================================================
// nubarrones — Los 4 Nubarrones grises, versión del universo de mascotas de
// los "4 jinetes del apocalipsis" de Gottman (predictores de ruptura).
//
// PRINCIPIO UX: la ciencia va invisible. Aquí viven como "los enemigos de su
// relación" con ejemplos cotidianos peruanos, y cada uno tiene su antídoto.
// NUNCA se muestra al usuario el dato de "93% de predicción de divorcio".
// ============================================================

export const NUBARRONES = {
  critico: {
    id: 'critico',
    nombre: 'El Crítico',
    emoji: '🌩️',
    jinete: 'Crítica',
    ataca: 'Ataca el carácter de la persona, no la acción. Usa "siempre" y "nunca".',
    ejemplos: [
      '"Tú NUNCA ayudas en la casa."',
      '"SIEMPRE llegas tarde, eres un desastre."',
      '"Contigo no se puede, así eres tú."',
    ],
    antidoto: 'Quéjate de la acción específica, no de la persona.',
    antidotoEjemplo:
      'En vez de "nunca ayudas", di: "me siento cargada cuando los platos se acumulan, ¿los turnamos?"',
    color: '#7892a7',
  },
  burlon: {
    id: 'burlon',
    nombre: 'El Burlón',
    emoji: '😏',
    jinete: 'Desprecio',
    ataca:
      'El más dañino. Sarcasmo, burla, poner los ojos en blanco, sentirse superior.',
    ejemplos: [
      '"Ay sí, el señor trabajó tanto hoy…" (con sarcasmo)',
      'Poner los ojos en blanco cuando el otro habla.',
      '"Qué bruta eres, en serio."',
    ],
    antidoto: 'Cultiva una cultura de aprecio diario. Reconoce lo bueno seguido.',
    antidotoEjemplo:
      'Antes de criticar, di algo que sí valoras: "gracias por lo que hiciste hoy, y me gustaría que…"',
    color: '#5a6b7a',
  },
  escudo: {
    id: 'escudo',
    nombre: 'El Escudo',
    emoji: '🛡️',
    jinete: 'Defensividad',
    ataca: 'Devuelve la culpa o se justifica en vez de escuchar. "Yo no fui, fuiste tú".',
    ejemplos: [
      '"¿Yo? Tú empezaste."',
      '"No es mi culpa, es que tú…"',
      '"Yo hago un montón, tú no ves nada."',
    ],
    antidoto: 'Asume aunque sea una parte de la responsabilidad.',
    antidotoEjemplo:
      '"Tienes razón en parte, pude avisarte antes. Perdona, ¿cómo lo arreglamos?"',
    color: '#8393a2',
  },
  muro: {
    id: 'muro',
    nombre: 'El Muro',
    emoji: '🧱',
    jinete: 'Bloqueo (stonewalling)',
    ataca: 'Se cierra, deja de responder, se va sin decir nada. La pareja se siente ignorada.',
    ejemplos: [
      'Quedarse callado y mirar el celular en plena conversación.',
      'Irse del cuarto sin decir nada.',
      'Responder solo "ya", "ajá", "lo que digas".',
    ],
    antidoto: 'Pausa consciente CON promesa de retomar. No es huir, es calmarse para volver.',
    antidotoEjemplo:
      '"Necesito 20 min para calmarme. SÍ vamos a hablar, no te estoy ignorando 💙"',
    color: '#6b7885',
  },
}

export const LISTA_NUBARRONES = Object.values(NUBARRONES)

// ---------- Test "¿cuál es tu nubarrón?" (autoevaluación opcional) ----------
// El resultado personaliza los tips del SOS. SIN asumir de antemano el jinete
// por género: lo determina el test.
export const TEST_NUBARRON = {
  intro:
    'Cuando discuten, ¿cómo sueles reaccionar? Responde honesto: esto te ayuda a conocerte, no a juzgarte.',
  preguntas: [
    {
      texto: 'Cuando algo me molesta de mi pareja, tiendo a…',
      opciones: [
        { texto: 'Decir "siempre" o "nunca" y generalizar', nubarron: 'critico' },
        { texto: 'Soltar un comentario sarcástico o burlón', nubarron: 'burlon' },
        { texto: 'Explicar por qué no fue mi culpa', nubarron: 'escudo' },
        { texto: 'Quedarme callado y cerrarme', nubarron: 'muro' },
      ],
    },
    {
      texto: 'En medio de una discusión fuerte…',
      opciones: [
        { texto: 'Ataco cómo es la persona ("eres un…")', nubarron: 'critico' },
        { texto: 'Pongo los ojos en blanco o me río con desprecio', nubarron: 'burlon' },
        { texto: 'Le devuelvo la culpa ("tú empezaste")', nubarron: 'escudo' },
        { texto: 'Me desconecto y dejo de responder', nubarron: 'muro' },
      ],
    },
    {
      texto: 'Lo que mi pareja más me reclamaría es que…',
      opciones: [
        { texto: 'Critico mucho y poco elogio', nubarron: 'critico' },
        { texto: 'Soy hiriente cuando me enojo', nubarron: 'burlon' },
        { texto: 'Nunca acepto mi parte', nubarron: 'escudo' },
        { texto: 'Me desaparezco emocionalmente', nubarron: 'muro' },
      ],
    },
    {
      texto: 'Después de pelear, lo más común en mí es…',
      opciones: [
        { texto: 'Seguir señalando todo lo que hace mal', nubarron: 'critico' },
        { texto: 'Quedarme resentido y tirar indirectas', nubarron: 'burlon' },
        { texto: 'Sentir que a mí me malinterpretaron', nubarron: 'escudo' },
        { texto: 'No querer hablar por horas o días', nubarron: 'muro' },
      ],
    },
  ],
}

/**
 * Calcula el nubarrón predominante a partir de las respuestas del test.
 * @param {string[]} respuestas  array de ids de nubarrón elegidos
 */
export function resultadoTest(respuestas) {
  const conteo = {}
  respuestas.forEach((r) => {
    conteo[r] = (conteo[r] || 0) + 1
  })
  let ganador = null
  let max = -1
  for (const [id, n] of Object.entries(conteo)) {
    if (n > max) {
      max = n
      ganador = id
    }
  }
  return ganador
}

/**
 * Detector estático (fallback sin IA): busca patrones de nubarrón en un texto.
 * Devuelve el primer nubarrón detectado o null.
 */
export function detectarNubarronEstatico(texto = '') {
  const t = texto.toLowerCase()
  if (/\bnunca\b|\bsiempre\b|eres un|eres una|así eres/.test(t)) return 'critico'
  if (/sarcas|obvio|ay sí|qué bruto|qué bruta|inútil|ridícul/.test(t)) return 'burlon'
  if (/tú empezaste|no es mi culpa|yo no fui|es que tú/.test(t)) return 'escudo'
  if (/no quiero hablar|me callo|déjame|no respond|me voy/.test(t)) return 'muro'
  return null
}
