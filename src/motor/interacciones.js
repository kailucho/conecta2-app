// ============================================================
// interacciones — resuelve etiqueta (emoji + texto) para cualquier tipo de
// interacción, tolerante a tipos nuevos o desconocidos. Compartido entre
// BandejaPareja (lo que recibiste) y ConfirmacionRespuesta (lo que tu
// pareja respondió a algo que enviaste), para no duplicar el mapeo.
// ============================================================
import { accionPorId } from '../datos/accionesRapidas.js'
import { alertaPorId } from '../datos/alertasEstado.js'

export const RESPUESTAS_GENERICAS = ['💗 Gracias', 'Hablemos luego', '🫂 Aquí estoy']

export function resolverInteraccion(it) {
  switch (it.type) {
    case 'quick_action': {
      const def = accionPorId(it.actionId)
      return {
        emoji: def?.emoji || '💌',
        texto: def?.notif || def?.label || 'Te envió algo',
        respuestas: def?.respuestas || RESPUESTAS_GENERICAS,
      }
    }
    case 'alerta_estado': {
      const def = alertaPorId(it.actionId)
      return {
        emoji: def?.emoji || '🚦',
        texto: def?.notif || def?.label || 'Te compartió cómo se siente',
        respuestas: ['🫂 Entendido, aquí estoy'],
      }
    }
    case 'mensaje':
      return {
        emoji: '💬',
        texto: 'Te escribió un mensajito',
        respuestas: RESPUESTAS_GENERICAS,
      }
    case 'animo':
      return {
        emoji: it.actionId || '💭',
        texto: 'Te compartió su ánimo',
        respuestas: RESPUESTAS_GENERICAS,
      }
    case 'aprecio':
      return {
        emoji: '💛',
        texto: 'Reconoció algo lindo de ti',
        respuestas: ['💛 Qué lindo', '🥰 Gracias', '🫂 Aquí estoy'],
      }
    default:
      return { emoji: '💌', texto: 'Te envió algo', respuestas: RESPUESTAS_GENERICAS }
  }
}

/**
 * Devuelve la interacción entrante (enviada por partnerId al userId) más
 * reciente por createdAt, o null si no hay ninguna. La usa Astro Azul para
 * reaccionar brevemente solo ante interacciones realmente nuevas.
 */
export function interaccionEntranteMasReciente(interacciones, userId, partnerId) {
  const entrantes = interacciones.filter(
    (it) => it.receiverId === userId && it.senderId === partnerId,
  )
  if (entrantes.length === 0) return null
  return entrantes.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b))
}
