// ============================================================
// protocolosSOS — protocolos paso a paso para el botón SOS 🚨 (fallback sin
// IA). Cada escenario tiene pasos concretos + activa el timer de enfriamiento
// de 20 min (autocalmado fisiológico de Gottman).
// ============================================================

export const ESCENARIOS_SOS = [
  {
    id: 'discusion',
    emoji: '💥',
    label: 'Discutimos',
    pasos: [
      'Respira. No hay que "ganar" la discusión, hay que entenderse.',
      'Si están muy alterados, activa la pausa de 20 min (más abajo).',
      'Cuando retomen, empieza suave: "me sentí ___ cuando ___".',
      'Escucha su versión sin interrumpir ni preparar tu defensa.',
      'Busquen el punto en común, no quién tiene la razón.',
    ],
  },
  {
    id: 'molesta',
    emoji: '😟',
    label: 'La(o) veo molesta(o)',
    pasos: [
      'No asumas que es contra ti; pregunta con calma cómo está.',
      'Si necesita espacio, dáselo sin dramatizar.',
      'Ofrece presencia: "estoy aquí si quieres hablar".',
      'Evita el "¿qué te pasa?" en tono de reclamo.',
      'Un gesto tranquilo (agua, un té, silencio acompañado) ayuda.',
    ],
  },
  {
    id: 'meti_pata',
    emoji: '😬',
    label: 'Metí la pata',
    pasos: [
      'Reconoce sin excusas: "tienes razón, me equivoqué".',
      'No sigas con "pero es que tú…"; eso borra la disculpa.',
      'Pregunta qué necesita para estar mejor.',
      'Repara con una acción concreta, no solo palabras.',
      'Dale tiempo si aún no está listo/a para soltarlo.',
    ],
  },
  {
    id: 'no_se',
    emoji: '🤷',
    label: 'No sé qué hice',
    pasos: [
      'Pregunta con humildad y curiosidad, no a la defensiva.',
      '"Siento que algo pasó y quiero entender, ¿me ayudas?"',
      'Escucha completo antes de responder.',
      'Si te señala algo, evita justificarte de una; asume tu parte.',
      'Agradece que te lo cuente: eso construye confianza.',
    ],
  },
]

export function escenarioPorId(id) {
  return ESCENARIOS_SOS.find((e) => e.id === id)
}

// Mensaje automático de "pausa sin abandono" al activar el timer.
export const MENSAJE_PAUSA =
  'Necesito 20 min para calmarme. SÍ vamos a hablar, no te estoy ignorando 💙'

// Sugerencia de inicio suave al terminar el timer.
export const INICIO_SUAVE_SUGERENCIA =
  'Ya pasó el tiempo. Retoma suave: "gracias por esperar. Me sentí ___ cuando ___, y me gustaría que ___". Sin culpar, contando cómo te sentiste.'

// Banner de derivación a ayuda profesional (no alarmista).
export const BANNER_TERAPIA = {
  titulo: 'Un apoyo extra 💙',
  texto:
    'Han usado el SOS varias veces últimamente. Discutir seguido NO significa que estén condenados: significa que hay áreas para trabajar. Un terapeuta de pareja puede ayudar muchísimo antes de que se acumule.',
  nota: 'Esta app acompaña, pero no reemplaza a un profesional.',
}
