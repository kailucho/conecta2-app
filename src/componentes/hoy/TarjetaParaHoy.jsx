// ============================================================
// TarjetaParaHoy — la ÚNICA recomendación de la portada. Rota de forma
// determinista por día entre misión, tip de fase, pregunta de conexión e idea
// de cita (ver datos/paraHoy.js). Reemplaza a MisionDiaria + TipDelDia.
//
// Tarjeta clara (contrasta contra el fondo oscuro), con un ícono temático y un
// botón de WhatsApp con ícono, replicando la firma visual "Recomendación de
// hoy" del diseño. El personaje ya es protagonista en el encabezado — aquí
// solo un ícono pequeño, para no repetirlo y restarle peso al encabezado.
//
// - Misión: se completa con +puntos (misma clave anti-spam que MisionDiaria).
// - Pregunta / idea de cita: se pueden enviar a la pareja. Sin vinculación,
//   NUNCA se bloquea: se prepara un mensaje de WhatsApp en su lugar (la
//   vinculación es opcional en toda la app).
// - Tip: informativo, sin acción.
// La misión diaria se ofrece como una línea compacta (no una segunda
// recomendación completa) cuando hoy tocó otro tipo de contenido.
// ============================================================

import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarMision } from '../../contexto/usarMision.js'
import { usarPuntos } from '../../contexto/usarPuntos.js'
import { convivenJuntos } from '../../datos/lenguaje.js'
import { contenidoParaHoy } from '../../datos/paraHoy.js'
import { accionPorId } from '../../datos/accionesRapidas.js'
import { notificar, vibrar } from '../../servicios/notificaciones.js'
import { abrirWhatsApp, debeUsarWhatsApp } from '../../servicios/whatsappService.js'
import { claveDia } from '../../motor/fechas.js'

const ICONO_POR_TIPO = { mision: '🎯', tip: '💡', pregunta: '💬', cita: '🌹' }

export default function TarjetaParaHoy({ semilla, faseId, hayDatos, onReaccion }) {
  const { perfil, config, enviarInteraccionPareja } = usarApp()
  const { otorgar } = usarPuntos()

  const conviven = convivenJuntos(perfil.tipoRelacion)
  const contenido = contenidoParaHoy({ semilla, faseId, hayDatos, conviven })

  const { mision, hecha: misionHecha, completar: completarMision } = usarMision(semilla)

  const [enviado, setEnviado] = useState(false)
  const [canal, setCanal] = useState('conecta2')

  // Enviar la recomendación a la pareja (pregunta, idea de cita o tip). Con
  // vínculo: interno. Sin vínculo: prepara WhatsApp (nunca bloquea con el
  // modal de vinculación). La tarjeta siempre ofrece una forma de compartir
  // la recomendación del día, sin importar el tipo que tocó hoy.
  async function enviarSugerencia() {
    const actionId =
      contenido.tipo === 'pregunta' ? 'pregunta_conexion' : contenido.tipo === 'cita' ? 'cita' : 'corazon'
    const def = accionPorId(actionId)

    if (debeUsarWhatsApp(perfil, config)) {
      const resultado = await abrirWhatsApp({ telefono: config.whatsappPareja, texto: contenido.texto })
      if (resultado.ok) {
        await otorgar(5, `detalle_preparado:${actionId}:${claveDia(new Date())}`)
      }
      setCanal('whatsapp')
      onReaccion?.(actionId)
      setEnviado(true)
      setTimeout(() => setEnviado(false), 3000)
      return
    }

    const resultado = await enviarInteraccionPareja({
      type: 'quick_action',
      actionId,
      category: 'gesture',
      note: contenido.texto,
      valencia: 1,
    }, { tipo: 'quick_action', actionId, note: contenido.texto })
    if (!resultado.ok) return
    notificar(def?.notif || 'Tu pareja te envió algo 💌', {
      ocultarSensible: !config.notifSensibles,
    })
    vibrar([30], config.vibracion)
    setCanal('conecta2')
    onReaccion?.(actionId)
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  // Toda recomendación que no sea una misión (con su propio "marcar como
  // hecha") ofrece enviarla: pregunta/cita al canal existente, y el tip del
  // día como un mensajito para compartir. Así la tarjeta siempre tiene una
  // acción de envío, como en el diseño.
  const puedeEnviar = contenido.accion !== 'completar'

  return (
    <TarjetaBase className="tarjeta-clara border-none text-slate-800">
      <div className="mb-3 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-acento/10 text-xl"
        >
          {ICONO_POR_TIPO[contenido.tipo] || '✨'}
        </span>
        <div className="flex-1 pt-1">
          <p className="mb-0.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-acento">
            {contenido.titulo}
            {contenido.accion === 'completar' && config.gamificacionActiva && (
              <span className="ml-auto text-[11px] font-bold text-slate-400">
                +{contenido.puntos} pts
              </span>
            )}
          </p>
          <p className="text-sm leading-snug text-slate-700">{contenido.texto}</p>
        </div>
      </div>

      {/* CTA según el tipo de recomendación */}
      {contenido.accion === 'completar' && (
        <button
          onClick={completarMision}
          disabled={misionHecha}
          className={`w-full rounded-pill py-2.5 font-titulo text-sm font-bold transition-transform active:scale-[0.98] ${
            misionHecha ? 'bg-exito/20 text-exito' : 'btn-acento text-white'
          }`}
        >
          {misionHecha ? '✓ ¡Misión cumplida!' : 'Marcar como hecha'}
        </button>
      )}

      {puedeEnviar && (
        <button
          onClick={enviarSugerencia}
          disabled={enviado}
          className={`flex w-full items-center justify-center gap-2 rounded-pill py-3 font-titulo text-sm font-bold transition-transform active:scale-[0.98] ${
            enviado ? 'bg-exito/20 text-exito' : 'btn-acento text-white'
          }`}
        >
          {enviado ? (
            canal === 'whatsapp' ? '✓ Preparado para WhatsApp' : '✓ Enviado 💌'
          ) : (
            <>
              <span
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-sm"
              >
                📞
              </span>
              {debeUsarWhatsApp(perfil, config) ? 'Enviar por WhatsApp' : 'Enviar'}
              {config.gamificacionActiva && (
                <span className="text-xs font-bold text-white/80">+5 pts</span>
              )}
            </>
          )}
        </button>
      )}

      {/* La misión sigue accesible aunque hoy toque otro tipo, como una línea
          compacta (no una segunda recomendación completa dentro de la tarjeta). */}
      {contenido.tipo !== 'mision' && (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-2 text-xs">
          <span className="flex-1 truncate text-slate-500">
            🎯 Misión de hoy: <span className="text-slate-600">{mision.titulo}</span>
          </span>
          <button
            onClick={completarMision}
            disabled={misionHecha}
            className={`shrink-0 rounded-pill px-3 py-1 font-bold ${
              misionHecha ? 'bg-exito/20 text-exito' : 'bg-acento/10 text-acento'
            }`}
          >
            {misionHecha ? '✓ Hecha' : 'Marcar hecha'}
          </button>
        </div>
      )}
    </TarjetaBase>
  )
}
