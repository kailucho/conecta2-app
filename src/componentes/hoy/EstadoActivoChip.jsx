// Chip compacto bajo el personaje: muestra MI estado emocional declarado hoy
// (alerta de estado activa) y permite quitarlo. Devuelve null si no hay ninguno.
import { usarApp } from '../../contexto/AppContexto.jsx'
import { estaExpirado } from '../../motor/fechas.js'
import { alertaPorId } from '../../datos/alertasEstado.js'

export default function EstadoActivoChip() {
  const { perfil, interacciones, editarInteraccion } = usarApp()

  const activa = interacciones.find(
    (it) =>
      it.type === 'alerta_estado' &&
      it.senderId === perfil.userId &&
      it.status !== 'cancelled' &&
      !estaExpirado(it.expiresAt),
  )
  if (!activa) return null

  const def = alertaPorId(activa.actionId)

  return (
    <div className="mx-auto mt-1 flex w-fit items-center gap-2 rounded-pill border border-borde bg-tarjeta px-3 py-1.5 text-sm text-texto-2">
      <span>
        {def?.emoji} {def?.label || 'Estado activo'}
      </span>
      <button
        onClick={() => editarInteraccion(activa.id, { status: 'cancelled' })}
        aria-label="Quitar aviso de estado"
        className="flex h-5 w-5 items-center justify-center rounded-full text-texto-3 hover:bg-tarjeta-hover"
      >
        ✕
      </button>
    </div>
  )
}
