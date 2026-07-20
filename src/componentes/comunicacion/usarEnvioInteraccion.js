// Hook compartido por los flujos del centro de interacciones y la barra: envía
// una acción rápida (gesto/necesidad) a la pareja reutilizando el modelo de
// interacciones existente, otorga puntos con anti-spam y notifica/vibra.
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarPuntos } from '../../contexto/usarPuntos.js'
import { notificar, vibrar } from '../../servicios/notificaciones.js'

export function usarEnvioInteraccion() {
  const { perfil, config, crearInteraccion } = usarApp()
  const { otorgar } = usarPuntos()

  // accion: objeto de ACCIONES_RAPIDAS. opts: { nota, claveAntiSpam, puntos }.
  return async function enviarAccion(accion, opts = {}) {
    const { nota = null, claveAntiSpam = `accion:${accion.id}`, puntos = 5 } = opts
    await crearInteraccion({
      coupleId: perfil.coupleId,
      senderId: perfil.userId,
      receiverId: perfil.partnerId,
      type: 'quick_action',
      actionId: accion.id,
      category: accion.categoria,
      note: (nota && nota.trim()) || null,
      valencia: 1,
    })
    await otorgar(puntos, claveAntiSpam)
    notificar(accion.notif, { ocultarSensible: !config.notifSensibles })
    vibrar([30], config.vibracion)
  }
}
