// ============================================================
// FlujoCarino — "Quiero darte cariño". Agrupa gestos cariñosos (quick_action),
// el aprecio del día (type aprecio) y el mensaje personalizado (delegado a
// MensajeLibre). Absorbe EnvioAnimo y AprecioDiario.
// ============================================================

import { useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarPuntos } from '../../contexto/usarPuntos.js'
import { claveDia } from '../../motor/fechas.js'
import { accionPorId } from '../../datos/accionesRapidas.js'
import { comoLlamarPareja } from '../../datos/lenguaje.js'
import { usarEnvioInteraccion } from './usarEnvioInteraccion.js'

const GESTOS = ['extrano', 'besitos', 'corazon', 'ganas_verte', 'buena_noticia']

export default function FlujoCarino({ alConfirmar, alVolver, onReaccion, alAbrirMensaje }) {
  const { perfil, config, crearInteraccion } = usarApp()
  const { otorgar } = usarPuntos()
  const enviarAccion = usarEnvioInteraccion()
  const [modoAprecio, setModoAprecio] = useState(false)
  const [texto, setTexto] = useState('')

  async function enviarGesto(id) {
    const a = accionPorId(id)
    if (!a) return
    await enviarAccion(a)
    onReaccion?.(a.expresion)
    alConfirmar({
      icono: a.emoji,
      titulo: 'Tu cariño va en camino',
      mensaje: `Le llegará: "${a.notif}"`,
      escena: true,
    })
  }

  async function enviarAprecio() {
    if (!texto.trim()) return
    await crearInteraccion({
      coupleId: perfil.coupleId,
      senderId: perfil.userId,
      receiverId: perfil.partnerId,
      type: 'aprecio',
      category: 'gesture',
      note: texto.trim(),
      valencia: 1,
    })
    await otorgar(15, `aprecio:${claveDia(new Date())}`)
    onReaccion?.('amor')
    alConfirmar({
      icono: '💛',
      titulo: 'Tu aprecio le va a llegar bonito',
      mensaje: null,
      escena: true,
    })
  }

  // Sub-paso: aprecio del día.
  if (modoAprecio) {
    return (
      <div className="space-y-3">
        <p className="font-titulo font-bold text-texto">💛 Aprecio del día</p>
        <p className="text-sm text-texto-2">
          ¿Qué hizo bien {comoLlamarPareja(perfil.rol, perfil.tipoRelacion)} hoy?
        </p>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Algo chiquito cuenta: me hizo reír, me apoyó, me trajo algo…"
          maxLength={140}
          rows={3}
          className="w-full resize-none rounded-xl border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
        />
        <button
          onClick={enviarAprecio}
          disabled={!texto.trim()}
          className="w-full rounded-pill bg-acento py-2.5 font-titulo text-sm font-bold text-white disabled:opacity-50"
        >
          Enviar aprecio 💛
        </button>
        <button
          onClick={() => setModoAprecio(false)}
          className="w-full text-center text-xs font-semibold text-texto-3"
        >
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-texto-2">Envíale un gesto lindo</p>
      <div className="grid grid-cols-2 gap-2">
        {GESTOS.map((id) => {
          const a = accionPorId(id)
          if (!a) return null
          return (
            <button
              key={id}
              onClick={() => enviarGesto(id)}
              className="flex min-h-touch flex-col items-center gap-1 rounded-xl border border-borde bg-tarjeta p-3 text-center transition-transform active:scale-95"
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-[11px] leading-tight text-texto-2">{a.label}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setModoAprecio(true)}
          className="rounded-xl border border-borde bg-tarjeta p-3 text-center text-sm text-texto transition-transform active:scale-95"
        >
          💛 Aprecio del día
        </button>
        <button
          onClick={alAbrirMensaje}
          className="rounded-xl border border-borde bg-tarjeta p-3 text-center text-sm text-texto transition-transform active:scale-95"
        >
          💌 Mensaje personalizado
        </button>
      </div>

      <button
        onClick={alVolver}
        className="w-full text-center text-xs font-semibold text-texto-3"
      >
        ← Volver
      </button>
    </div>
  )
}
