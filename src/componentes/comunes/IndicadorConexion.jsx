// Indicador compacto de conexión para el encabezado: 5 corazoncitos que se
// encienden según el brillo del ratio 5:1. Nunca muestra números ni culpa.
// Se oculta si la gamificación está desactivada.
import { usarApp } from '../../contexto/AppContexto.jsx'
import { balanceReciente } from '../../motor/conexion.js'

export default function IndicadorConexion() {
  const { interacciones, config } = usarApp()
  if (!config.gamificacionActiva) return null

  const balance = balanceReciente(interacciones, 7)
  const corazones = Math.round(balance.brillo * 5)

  return (
    <div
      className="flex gap-0.5"
      aria-label="Conexión de los últimos días"
      title="Conexión de los últimos días"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="text-xs transition-opacity"
          style={{ opacity: i < corazones ? 1 : 0.2 }}
          aria-hidden
        >
          💗
        </span>
      ))}
    </div>
  )
}
