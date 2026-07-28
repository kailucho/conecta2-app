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
import { parejaVinculada } from '../../servicios/syncService.js'
import { abrirWhatsApp } from '../../servicios/whatsappService.js'

export default function MensajeLibre({ abierto, alCerrar, onReaccion }) {
  const { perfil, config, enviarInteraccionPareja } = usarApp()
  const { otorgar } = usarPuntos()
  const vinculada = parejaVinculada(perfil)
  const [texto, setTexto] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [canal, setCanal] = useState('conecta2') // 'whatsapp' | 'conecta2', resultado del último envío

  function cerrar() {
    setEnviado(false)
    alCerrar()
  }

  function cerrarDespuesEnvio() {
    setTexto('')
    cerrar()
  }

  async function enviar(contenido) {
    const cuerpo = (contenido ?? texto).trim()
    if (!cuerpo) return

    // Sin vinculación: siempre WhatsApp. Con vinculación: WhatsApp es la
    // acción principal; "Enviar por Conecta2" queda como canal secundario.
    if (!vinculada) {
      const resultado = await abrirWhatsApp({ telefono: config.whatsappPareja, texto: cuerpo })
      if (resultado.ok) await otorgar(5, `detalle_preparado:mensaje:${claveDia(new Date())}`)
      setCanal('whatsapp')
      setEnviado(true)
      return
    }

    const resultado = await enviarInteraccionPareja({
      type: 'mensaje',
      actionId: null,
      category: 'gesture',
      note: cuerpo,
      valencia: 1,
    }, { tipo: 'mensaje', note: cuerpo })
    if (!resultado.ok) return
    await otorgar(5, `mensaje:${claveDia(new Date())}`)
    notificar('Tu pareja te escribió un mensajito 💬', {
      body: cuerpo,
      ocultarSensible: !config.notifSensibles,
    })
    vibrar([30], config.vibracion)
    onReaccion?.('amor')
    setCanal('conecta2')
    setEnviado(true)
  }

  async function enviarPorWhatsApp() {
    const cuerpo = texto.trim()
    if (!cuerpo) return
    const resultado = await abrirWhatsApp({ telefono: config.whatsappPareja, texto: cuerpo })
    if (resultado.ok) await otorgar(5, `detalle_preparado:mensaje:${claveDia(new Date())}`)
    setCanal('whatsapp')
    setEnviado(true)
  }

  return (
    <ModalHoja abierto={abierto} alCerrar={cerrar} titulo="Dile algo a tu amor 💌">
      {enviado ? (
        <div className="space-y-4 py-4 text-center">
          <div className="text-5xl">💌</div>
          <p className="font-titulo font-bold text-texto">
            {canal === 'whatsapp' ? 'Mensaje preparado para WhatsApp.' : '¡Mensaje enviado!'}
          </p>
          {canal === 'whatsapp' && (
            <p className="text-xs text-texto-3">
              Ábrelo en WhatsApp y confírmalo tú mismo/a cuando quieras.
            </p>
          )}
          <button
            onClick={cerrarDespuesEnvio}
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
          {vinculada ? (
            <div className="flex gap-2">
              <button
                onClick={enviarPorWhatsApp}
                disabled={!texto.trim()}
                className="flex-1 rounded-pill border border-borde bg-tarjeta py-3 font-titulo font-bold text-texto disabled:opacity-50"
              >
                Abrir WhatsApp 💬
              </button>
              <button
                onClick={() => enviar()}
                disabled={!texto.trim()}
                className="flex-1 rounded-pill bg-acento py-3 font-titulo font-bold text-white disabled:opacity-50"
              >
                Enviar por Conecta2
              </button>
            </div>
          ) : (
            <button
              onClick={() => enviar()}
              disabled={!texto.trim()}
              className="w-full rounded-pill bg-acento py-3 font-titulo font-bold text-white disabled:opacity-50"
            >
              Abrir WhatsApp 💬
            </button>
          )}

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
