// Hook compartido por los flujos del centro de interacciones y la barra.
// Con pareja vinculada: envía internamente (Realtime + cola offline, modelo
// existente). SIN vinculación: la vinculación es opcional, así que la acción
// no se bloquea — se prepara un mensaje natural para WhatsApp en su lugar.
// Nunca se registra como "enviado/recibido": como mucho, "preparado".
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarPuntos } from '../../contexto/usarPuntos.js'
import { notificar, vibrar } from '../../servicios/notificaciones.js'
import { abrirWhatsApp, debeUsarWhatsApp } from '../../servicios/whatsappService.js'
import { mensajePreparado } from '../../datos/mensajesWhatsApp.js'
import { diaDelAnio } from '../../motor/fechas.js'

export function usarEnvioInteraccion() {
  const { perfil, config, enviarInteraccionPareja } = usarApp()
  const { otorgar } = usarPuntos()

  // accion: objeto de ACCIONES_RAPIDAS. opts: { nota, claveAntiSpam, puntos, tono }.
  return async function enviarAccion(accion, opts = {}) {
    const { nota = null, claveAntiSpam = `accion:${accion.id}`, puntos = 5, tono = 'divertido' } = opts

    // Sin vínculo: nunca bloquea. Con vínculo: respeta el canal predeterminado
    // elegido en Ajustes → Comunicación (WhatsApp o Conecta2).
    if (debeUsarWhatsApp(perfil, config)) {
      const texto = nota?.trim() || mensajePreparado(accion.id, tono, diaDelAnio())
      const resultado = await abrirWhatsApp({ telefono: config.whatsappPareja, texto })
      if (resultado.ok) {
        // Reconocimiento como "detalle preparado", nunca como mensaje entregado.
        await otorgar(puntos, `detalle_preparado:${claveAntiSpam}`)
      }
      return { ok: resultado.ok, canal: 'whatsapp', estado: 'preparado' }
    }

    const resultado = await enviarInteraccionPareja({
      type: 'quick_action',
      actionId: accion.id,
      category: accion.categoria,
      note: (nota && nota.trim()) || null,
      valencia: 1,
    }, {
      tipo: 'quick_action',
      actionId: accion.id,
      note: (nota && nota.trim()) || null,
    })
    if (!resultado.ok) return resultado
    await otorgar(puntos, claveAntiSpam)
    notificar(accion.notif, { ocultarSensible: !config.notifSensibles })
    vibrar([30], config.vibracion)
    return { ...resultado, canal: 'conecta2' }
  }
}
