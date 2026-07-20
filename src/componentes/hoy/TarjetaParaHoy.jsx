// ============================================================
// TarjetaParaHoy — la ÚNICA recomendación de la portada. Rota de forma
// determinista por día entre misión, tip de fase, pregunta de conexión e idea
// de cita (ver datos/paraHoy.js). Reemplaza a MisionDiaria + TipDelDia.
//
// - Misión: se completa con +puntos (misma clave anti-spam que MisionDiaria).
// - Pregunta / idea de cita: se pueden enviar a la pareja como interacción.
// - Tip: informativo, sin acción.
// La misión diaria sigue siendo completable siempre desde el pie de la tarjeta.
// ============================================================

import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarMision } from '../../contexto/usarMision.js'
import { convivenJuntos } from '../../datos/lenguaje.js'
import { contenidoParaHoy } from '../../datos/paraHoy.js'
import { accionPorId } from '../../datos/accionesRapidas.js'
import { notificar, vibrar } from '../../servicios/notificaciones.js'

export default function TarjetaParaHoy({ semilla, faseId, hayDatos, onReaccion }) {
  const { perfil, config, enviarInteraccionPareja } = usarApp()

  const conviven = convivenJuntos(perfil.tipoRelacion)
  const contenido = contenidoParaHoy({ semilla, faseId, hayDatos, conviven })

  const { mision, hecha: misionHecha, completar: completarMision } = usarMision(semilla)

  const [enviado, setEnviado] = useState(false)
  const [verMision, setVerMision] = useState(false)

  // Enviar la pregunta o la idea de cita como interacción a la pareja.
  async function enviarSugerencia() {
    const actionId = contenido.tipo === 'pregunta' ? 'pregunta_conexion' : 'cita'
    const def = accionPorId(actionId)
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
    onReaccion?.(actionId)
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  return (
    <TarjetaBase>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-acento">
          {contenido.titulo}
        </span>
        {contenido.accion === 'completar' && config.gamificacionActiva && (
          <span className="text-xs font-bold text-texto-3">+{contenido.puntos} pts</span>
        )}
      </div>

      <p className="mb-3 text-texto">{contenido.texto}</p>

      {/* CTA según el tipo de recomendación */}
      {contenido.accion === 'completar' && (
        <button
          onClick={completarMision}
          disabled={misionHecha}
          className={`w-full rounded-pill py-2.5 font-titulo text-sm font-bold transition-transform active:scale-[0.98] ${
            misionHecha ? 'bg-exito/20 text-exito' : 'bg-acento text-white'
          }`}
        >
          {misionHecha ? '✓ ¡Misión cumplida!' : 'Marcar como hecha'}
        </button>
      )}

      {(contenido.accion === 'enviar_pregunta' || contenido.accion === 'proponer') && (
        <button
          onClick={enviarSugerencia}
          disabled={enviado}
          className={`w-full rounded-pill py-2.5 font-titulo text-sm font-bold transition-transform active:scale-[0.98] ${
            enviado ? 'bg-exito/20 text-exito' : 'bg-acento text-white'
          }`}
        >
          {enviado
            ? '✓ Enviado 💌'
            : contenido.accion === 'proponer'
            ? 'Proponérselo 🌹'
            : 'Enviársela 💬'}
        </button>
      )}

      {/* La misión siempre queda accesible, aunque hoy toque otro tipo. */}
      {contenido.tipo !== 'mision' && (
        <div className="mt-3 border-t border-borde pt-2">
          {!verMision ? (
            <button
              onClick={() => setVerMision(true)}
              className="w-full text-left text-xs font-semibold text-texto-3"
            >
              🎯 Ver misión de hoy
            </button>
          ) : (
            <div className="animate-aparecer">
              <p className="text-xs font-bold uppercase tracking-wide text-acento">
                🎯 {mision.titulo}
              </p>
              <p className="mb-2 mt-1 text-sm text-texto-2">{mision.texto}</p>
              <button
                onClick={completarMision}
                disabled={misionHecha}
                className={`w-full rounded-pill py-2 text-xs font-bold transition-transform active:scale-[0.98] ${
                  misionHecha ? 'bg-exito/20 text-exito' : 'bg-acento text-white'
                }`}
              >
                {misionHecha ? '✓ ¡Misión cumplida!' : 'Marcar como hecha'}
              </button>
            </div>
          )}
        </div>
      )}
    </TarjetaBase>
  )
}
