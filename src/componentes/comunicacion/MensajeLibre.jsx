// ============================================================
// MensajeLibre — sheet para escribir un mensaje personalizado o elegir una
// frase sugerida. Crea una interacción de type 'mensaje' (nueva, compatible con
// conexion.js por valencia 1 y con BandejaPareja por su resolvedor de tipos).
// ============================================================

import { useState } from 'react'
import ModalHoja from '../comunes/ModalHoja.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarPuntos } from '../../contexto/usarPuntos.js'
import { claveDia } from '../../motor/fechas.js'
import { frasesSugeridas } from '../../datos/paraHoy.js'
import { notificar, vibrar } from '../../servicios/notificaciones.js'

export default function MensajeLibre({ abierto, alCerrar, onReaccion }) {
  const { perfil, config, crearInteraccion } = usarApp()
  const { otorgar } = usarPuntos()
  const [texto, setTexto] = useState('')
  const [enviado, setEnviado] = useState(false)

  function cerrar() {
    setTexto('')
    setEnviado(false)
    alCerrar()
  }

  async function enviar(contenido) {
    const cuerpo = (contenido ?? texto).trim()
    if (!cuerpo) return
    await crearInteraccion({
      coupleId: perfil.coupleId,
      senderId: perfil.userId,
      receiverId: perfil.partnerId,
      type: 'mensaje',
      actionId: null,
      category: 'gesture',
      note: cuerpo,
      valencia: 1,
    })
    await otorgar(5, `mensaje:${claveDia(new Date())}`)
    notificar('Tu pareja te escribió un mensajito 💬', {
      body: cuerpo,
      ocultarSensible: !config.notifSensibles,
    })
    vibrar([30], config.vibracion)
    onReaccion?.('amor')
    setEnviado(true)
  }

  return (
    <ModalHoja abierto={abierto} alCerrar={cerrar} titulo="Dile algo a tu amor 💌">
      {enviado ? (
        <div className="space-y-4 py-4 text-center">
          <div className="text-5xl">💌</div>
          <p className="font-titulo font-bold text-texto">¡Mensaje enviado!</p>
          <button
            onClick={cerrar}
            className="w-full rounded-pill bg-acento py-2.5 font-bold text-white"
          >
            Listo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escríbele algo bonito…"
            maxLength={200}
            rows={3}
            autoFocus
            className="w-full resize-none rounded-xl border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
          />
          <button
            onClick={() => enviar()}
            disabled={!texto.trim()}
            className="w-full rounded-pill bg-acento py-3 font-titulo font-bold text-white disabled:opacity-50"
          >
            Enviar 💌
          </button>

          <div className="pt-1">
            <p className="mb-2 text-xs font-semibold text-texto-3">O elige una frase:</p>
            <div className="flex flex-wrap gap-2">
              {frasesSugeridas().map((f, i) => (
                <button
                  key={i}
                  onClick={() => setTexto(f)}
                  className="rounded-pill border border-borde bg-tarjeta px-3 py-1.5 text-xs text-texto-2 active:scale-95"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModalHoja>
  )
}
