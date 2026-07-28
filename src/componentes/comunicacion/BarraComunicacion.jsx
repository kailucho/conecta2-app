// ============================================================
// BarraComunicacion — barra fija estilo compositor: [ ＋ | "Dile algo…" | 💗 ].
//   ＋            abre el centro de interacciones.
//   área central  abre el compositor de mensaje (botón, no input: evita el
//                 teclado bajo un elemento fijo).
//   💗            envía una reacción rápida en un toque (con anti-doble-envío);
//                 mantener pulsado permite elegir el tipo de reacción.
// Se ubica justo encima de la navegación inferior.
// ============================================================

import { useRef, useState } from 'react'
import { accionPorId, ACCIONES_DESTACADAS_HOY } from '../../datos/accionesRapidas.js'
import { claveDia } from '../../motor/fechas.js'
import { usarEnvioInteraccion } from './usarEnvioInteraccion.js'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { parejaVinculada } from '../../servicios/syncService.js'

// Mismo catálogo que AccionesRapidasGrid (Hoy): mantener presionado el
// corazón muestra un atajo a las mismas 4 acciones destacadas del día, en
// vez de un segundo set de gestos distinto.
const RAPIDAS = ACCIONES_DESTACADAS_HOY

export default function BarraComunicacion({ alAbrirCentro, alAbrirMensaje, onReaccion }) {
  const enviarAccion = usarEnvioInteraccion()
  const { perfil } = usarApp()
  const vinculada = parejaVinculada(perfil)
  const enviandoRef = useRef(false)
  const timerRef = useRef(null)
  const longRef = useRef(false)
  const [feedback, setFeedback] = useState(false)
  const [popover, setPopover] = useState(false)

  async function enviarRapida(id) {
    setPopover(false)
    if (enviandoRef.current) return // anti-doble-envío
    enviandoRef.current = true
    const a = accionPorId(id)
    let canalUsado = 'conecta2'
    if (a) {
      const resultado = await enviarAccion(a, { claveAntiSpam: `reaccion:${claveDia(new Date())}` })
      if (!resultado?.ok) {
        enviandoRef.current = false
        return resultado
      }
      canalUsado = resultado.canal || 'conecta2'
      onReaccion?.(a.expresion)
    }
    setFeedback(canalUsado === 'whatsapp' ? 'whatsapp' : 'conecta2')
    setTimeout(() => setFeedback(false), 1500)
    setTimeout(() => {
      enviandoRef.current = false
    }, 3000)
  }

  function onPressStart() {
    longRef.current = false
    timerRef.current = setTimeout(() => {
      longRef.current = true
      setPopover(true)
    }, 500)
  }
  function onPressEnd() {
    clearTimeout(timerRef.current)
    if (!longRef.current) enviarRapida('corazon')
  }
  function onPressCancel() {
    clearTimeout(timerRef.current)
  }

  return (
    <div
      className="fixed left-0 right-0 z-30 px-4"
      style={{ bottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="relative mx-auto flex max-w-lg items-center gap-2 rounded-pill border border-borde bg-tarjeta/95 p-1.5 shadow-lg backdrop-blur">
        <button
          onClick={alAbrirCentro}
          aria-label="Abrir más acciones"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-acento/15 text-2xl text-acento transition-transform active:scale-90"
        >
          ＋
        </button>

        <button
          onClick={alAbrirMensaje}
          className="min-h-touch flex-1 rounded-pill px-3 py-2 text-left text-sm text-texto-3"
        >
          {feedback === 'whatsapp' ? (
            <span className="font-semibold text-acento">💗 Mensaje preparado para WhatsApp</span>
          ) : feedback === 'conecta2' ? (
            <span className="font-semibold text-acento">💗 ¡Enviado!</span>
          ) : (
            vinculada ? 'Dile algo a tu amor…' : 'Dile algo a tu amor por WhatsApp…'
          )}
        </button>

        <button
          onPointerDown={onPressStart}
          onPointerUp={onPressEnd}
          onPointerLeave={onPressCancel}
          aria-label="Enviar una reacción rápida"
          className="btn-acento flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl transition-transform active:scale-90"
        >
          💗
        </button>

        {popover && (
          <div className="absolute bottom-14 right-0 flex gap-1 rounded-pill border border-borde bg-fondo-2 p-1.5 shadow-xl">
            {RAPIDAS.map((id) => {
              const a = accionPorId(id)
              return (
                <button
                  key={id}
                  onClick={() => enviarRapida(id)}
                  aria-label={a?.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-transform active:scale-90 hover:bg-tarjeta-hover"
                >
                  {a?.emoji}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
