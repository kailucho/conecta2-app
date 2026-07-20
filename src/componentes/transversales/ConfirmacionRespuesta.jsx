// ============================================================
// ConfirmacionRespuesta — avisa cuando la pareja reconoció/respondió algo
// que TÚ enviaste (p.ej. tocó "💗 Gracias"). BandejaPareja solo muestra lo
// que recibes; esto cierra el otro lado sin necesidad de rediseñar nada.
// Se descarta con un toque y no vuelve a aparecer (se recuerda localmente).
// ============================================================
import { useEffect, useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { obtener, guardar, CLAVES } from '../../servicios/storageService.js'
import { resolverInteraccion } from '../../motor/interacciones.js'

export default function ConfirmacionRespuesta() {
  const { perfil, interacciones } = usarApp()
  const [vistas, setVistas] = useState(null)

  useEffect(() => {
    obtener(CLAVES.confirmacionesVistas, []).then(setVistas)
  }, [])

  if (vistas === null) return null

  const pendientes = interacciones
    .filter(
      (it) =>
        it.senderId === perfil.userId &&
        it.status === 'acknowledged' &&
        it.respuestaTexto &&
        !vistas.includes(it.id),
    )
    .sort((a, b) => new Date(b.respondedAt || 0) - new Date(a.respondedAt || 0))

  if (pendientes.length === 0) return null
  const it = pendientes[0]
  const original = resolverInteraccion(it)

  async function descartar() {
    const nuevas = [...vistas, it.id]
    await guardar(CLAVES.confirmacionesVistas, nuevas)
    setVistas(nuevas)
  }

  return (
    <TarjetaBase className="animate-aparecer">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-texto">
          {original.emoji} Tu pareja respondió a "{original.texto}
          {it.note ? `: ${it.note}` : ''}" con: <strong>"{it.respuestaTexto}"</strong>
        </p>
        <button
          onClick={descartar}
          aria-label="Descartar"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-tarjeta-hover text-xs text-texto-2"
        >
          ✕
        </button>
      </div>
    </TarjetaBase>
  )
}
