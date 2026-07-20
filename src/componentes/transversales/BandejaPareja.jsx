// Bandeja de lo recibido de la pareja. En Fase 1 (un rol por instalación) la
// bandeja llega vacía porque aún no hay cuentas vinculadas; se llenará en
// Fase 2. El receptor podrá responder con un tap (🫂 "entendido, aquí estoy"),
// lo que dispara la animación conjunta de los personajes.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import EscenaJuntos from '../personajes/EscenaJuntos.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { estaExpirado } from '../../motor/fechas.js'
import { resolverInteraccion } from '../../motor/interacciones.js'

export default function BandejaPareja() {
  const { perfil, interacciones, editarInteraccion } = usarApp()
  const [celebrar, setCelebrar] = useState(false)

  // Recibidos = dirigidos a mí, no míos, no expirados, sin responder.
  const recibidos = interacciones.filter(
    (it) =>
      it.receiverId === perfil.userId &&
      it.senderId !== perfil.userId &&
      it.status !== 'acknowledged' &&
      !estaExpirado(it.expiresAt),
  )

  if (recibidos.length === 0) return null

  async function responder(it, respuesta) {
    await editarInteraccion(it.id, {
      status: 'acknowledged',
      respondedAt: new Date().toISOString(),
      respuestaTexto: respuesta,
    })
    setCelebrar(true)
    setTimeout(() => setCelebrar(false), 2600)
  }

  return (
    <TarjetaBase>
      <p className="mb-2 font-titulo font-bold text-texto">💌 De tu pareja</p>

      {celebrar && <EscenaJuntos puntosConexion={10} mensaje="¡Respondiste con cariño!" />}

      <div className="space-y-3">
        {recibidos.map((it) => {
          const def = resolverInteraccion(it)
          return (
            <div key={it.id} className="rounded-xl bg-tarjeta-hover p-3">
              <p className="text-sm text-texto">
                {def.emoji} {def.texto}
              </p>
              {it.note && <p className="text-xs italic text-texto-2">"{it.note}"</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {def.respuestas.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => responder(it, r)}
                    className="rounded-pill bg-acento/20 px-3 py-1.5 text-xs font-bold text-acento active:scale-95"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </TarjetaBase>
  )
}
