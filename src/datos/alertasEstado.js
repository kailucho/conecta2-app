// ============================================================
// alertasEstado — Alertas de Estado Emocional 🚦.
// Botones rápidos para DECLARAR cómo me siento. La pareja recibe la alerta con
// instrucciones de qué hacer ✅ y qué NO ❌. El estado expira a medianoche.
//
// Distinto de las acciones rápidas (necesidad) y del SOS (conflicto).
// ============================================================

export const ALERTAS_ESTADO = [
  {
    id: 'irritable',
    emoji: '🔴',
    label: 'Irritable',
    notif: 'Tu pareja anda irritable hoy. Un poco de calma ayuda 🔴',
    queHacer: ['Dale espacio', 'Sé amable', 'Ten paciencia'],
    queNo: ['No preguntes "por qué"', 'No lo tomes personal', 'No la/lo presiones'],
    mensaje: 'Solo necesita comprensión, no es contra ti.',
  },
  {
    id: 'cueva',
    emoji: '🕳️',
    label: 'Modo cueva',
    notif: 'Tu pareja entró en modo cueva 🕳️',
    queHacer: ['Dale su espacio', 'Avísale que estás ahí', 'Espera a que salga'],
    queNo: ['No lo persigas', 'No insistas en hablar ya', 'No te lo tomes personal'],
    mensaje: 'Necesita procesar en silencio. Volverá.',
  },
  {
    id: 'sensible',
    emoji: '💙',
    label: 'Sensible',
    notif: 'Tu pareja anda sensible hoy 💙',
    queHacer: ['Sé tierno/a', 'Escucha sin juzgar', 'Ofrece cariño'],
    queNo: ['No minimices lo que siente', 'No digas "no es para tanto"', 'No la/lo dejes solo/a'],
    mensaje: 'Un poco de suavidad extra le cae bien.',
  },
  {
    id: 'sin_bateria',
    emoji: '🔋',
    label: 'Sin batería',
    notif: 'Tu pareja está sin batería hoy 🔋',
    queHacer: ['Baja las exigencias', 'Ofrece descanso', 'Encárgate de lo pesado'],
    queNo: ['No la/lo cargues de tareas', 'No insistas en salir', 'No la/lo apures'],
    mensaje: 'Hoy toca recargar tranquilo/a.',
  },
  {
    id: 'estresado',
    emoji: '🌪️',
    label: 'Estresado/a',
    notif: 'Tu pareja está estresado/a 🌪️',
    queHacer: ['Escucha primero', 'Pregunta si quiere ayuda o desahogo', 'Dale calma'],
    queNo: ['No lo resuelvas de una', 'No sumes presión', 'No minimices'],
    mensaje: 'Primero necesita sentirse escuchado/a.',
  },
]

export function alertaPorId(id) {
  return ALERTAS_ESTADO.find((a) => a.id === id)
}
