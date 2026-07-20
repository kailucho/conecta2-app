// ============================================================
// accionesRapidas — "¿Qué necesitas de tu amor hoy?" 💌
//
// Distinción conceptual (importante mantenerla separada):
//   - estado emocional  (cómo me siento)   → Alertas de Estado
//   - necesidad         (qué necesito)      → estas Acciones Rápidas
//   - gesto cariñoso    (qué deseo enviarle)→ Envío de ánimo/gestos
//   - conflicto                             → SOS
//
// Cada acción tiene: emoji, label, mensaje de notificación para la pareja,
// categoría, si permite nota, expresión del personaje (reacción) y respuestas
// sugeridas de un tap para quien la recibe.
// ============================================================

export const ACCIONES_RAPIDAS = [
  {
    id: 'hambre',
    emoji: '🍔',
    label: 'Tengo hambre',
    categoria: 'need',
    notif: 'Tu amorcito tiene hambre 🍔',
    expresion: 'pensativo',
    permiteNota: true,
    respuestas: ['¿Qué se te antoja?', 'Ya voy por comida', 'Misión aceptada'],
  },
  {
    id: 'engreir',
    emoji: '🥺',
    label: 'Quiero que me engrías',
    categoria: 'need',
    notif: 'Hoy necesita un poquito más de cariño 🥺',
    expresion: 'tierno',
    permiteNota: false,
    respuestas: ['Ven, te voy a engreír', '¿Qué necesita mi amor?', 'Misión aceptada'],
  },
  {
    id: 'abrazo',
    emoji: '🫂',
    label: 'Necesito un abrazo',
    categoria: 'need',
    notif: 'Tu pareja necesita sentirte cerca 🫂',
    expresion: 'tierno',
    permiteNota: false,
    respuestas: ['Abrazo enviado', 'Guárdame uno', 'Ven por tu abrazo'],
  },
  {
    id: 'extrano',
    emoji: '💕',
    label: 'Te extraño',
    categoria: 'gesture',
    notif: 'Alguien está pensando mucho en ti 💕',
    expresion: 'amor',
    permiteNota: true,
    respuestas: ['Yo también te extraño', 'Nos vemos pronto', 'Te mando mucho amor'],
  },
  {
    id: 'besitos',
    emoji: '😘',
    label: 'Quiero besitos',
    categoria: 'need',
    notif: 'Tu amor está reclamando sus besitos 😘',
    expresion: 'amor',
    permiteNota: false,
    respuestas: ['Besitos enviados', 'Tienes muchos pendientes', 'Ven a cobrarlos'],
  },
  {
    id: 'antojo',
    emoji: '🍫',
    label: 'Tengo un antojo',
    categoria: 'need',
    notif: 'Misión desbloqueada: conseguir su antojo 🍫',
    expresion: 'pensativo',
    permiteNota: true,
    respuestas: ['¿Qué se te antoja?', 'Misión aceptada', 'Voy a sorprenderte'],
  },
  {
    id: 'sin_energia',
    emoji: '🔋',
    label: 'Estoy sin energía',
    categoria: 'feeling',
    notif: 'Hoy necesita tranquilidad, apoyo y paciencia 🔋',
    expresion: 'cansado',
    permiteNota: true,
    respuestas: ['Descansa, yo te apoyo', 'Entendido, aquí estoy', '¿Hay algo que pueda hacer?'],
  },
  {
    id: 'estresado',
    emoji: '🌪️',
    label: 'Estoy estresado/a',
    categoria: 'feeling',
    notif: 'Primero necesita sentirse escuchado/a 🌪️',
    expresion: 'pensativo',
    permiteNota: true,
    respuestas: ['Cuéntame, te escucho', 'Estoy aquí contigo', '¿Quieres hablar o prefieres descansar?'],
  },
  {
    id: 'momento',
    emoji: '🌿',
    label: 'Necesito un momento',
    categoria: 'need',
    notif: 'Necesita un poco de espacio, pero no quiere sentirse abandonado/a 🌿',
    expresion: 'pensativo',
    permiteNota: false,
    respuestas: ['Entendido, aquí estoy', 'Tómate tu tiempo', 'Te escribo más tarde'],
  },
  {
    id: 'buena_noticia',
    emoji: '🎉',
    label: 'Tengo una buena noticia',
    categoria: 'gesture',
    notif: '¡Tu pareja tiene algo bonito que contarte! 🎉',
    expresion: 'sorpresa',
    permiteNota: true,
    respuestas: ['¡Cuéntame!', 'Quiero saberlo todo', '¡Celebremos!'],
  },
  {
    id: 'ganas_verte',
    emoji: '😏',
    label: 'Tengo ganas de verte',
    categoria: 'gesture',
    notif: 'Tu pareja quiere pasar tiempo contigo 😏',
    expresion: 'amor',
    permiteNota: false,
    respuestas: ['Yo también', 'Organicemos algo', 'Nos vemos pronto'],
  },
  {
    id: 'meti_pata',
    emoji: '😅',
    label: 'Creo que metí la pata',
    categoria: 'need',
    notif: 'Tu pareja quiere arreglar algo contigo 😅',
    expresion: 'pensativo',
    permiteNota: true,
    respuestas: ['Te escucho', 'Hablemos con calma', 'Gracias por decírmelo'],
  },
  // ---- Gestos y planes del centro de interacciones (aditivos) ----
  {
    id: 'corazon',
    emoji: '💗',
    label: 'Pensando en ti',
    categoria: 'gesture',
    notif: 'Alguien está pensando en ti 💗',
    expresion: 'amor',
    permiteNota: false,
    respuestas: ['Yo también 💗', 'Qué lindo', 'Me alegraste el día'],
  },
  {
    id: 'cita',
    emoji: '🌹',
    label: 'Propongo una cita',
    categoria: 'gesture',
    notif: 'Tu pareja quiere organizar una cita 🌹',
    expresion: 'amor',
    permiteNota: true,
    respuestas: ['¡Me apunto!', '¿Cuándo?', 'Me encanta la idea'],
  },
  {
    id: 'pelicula',
    emoji: '🍿',
    label: 'Ver una película',
    categoria: 'gesture',
    notif: 'Tu pareja quiere ver una peli contigo 🍿',
    expresion: 'feliz',
    permiteNota: true,
    respuestas: ['¡Dale!', 'Elige tú', 'Yo llevo el popcorn'],
  },
  {
    id: 'salir_comer',
    emoji: '🍽️',
    label: 'Salir a comer',
    categoria: 'gesture',
    notif: 'Tu pareja quiere salir a comer contigo 🍽️',
    expresion: 'feliz',
    permiteNota: true,
    respuestas: ['¡Vamos!', '¿Dónde?', 'Me muero de hambre'],
  },
  {
    id: 'pregunta_conexion',
    emoji: '💬',
    label: 'Una pregunta para los dos',
    categoria: 'gesture',
    notif: 'Tu pareja te dejó una pregunta para conversar 💬',
    expresion: 'pensativo',
    permiteNota: true,
    respuestas: ['Buena pregunta…', 'Déjame pensar', 'Hablemos hoy'],
  },
]

// Las primeras N que se muestran antes de "Ver más".
export const ACCIONES_DESTACADAS = 6

export function accionPorId(id) {
  return ACCIONES_RAPIDAS.find((a) => a.id === id)
}
