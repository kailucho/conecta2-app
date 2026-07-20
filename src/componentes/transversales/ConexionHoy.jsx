// Bloque "Conexión de hoy" — refleja el balance de conexión (ratio 5:1
// invisible). Nunca muestra números crudos ni culpa: solo mensajes positivos y
// un brillo que crece con los gestos.
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { balanceReciente, conexionHoy, mensajeConexion } from '../../motor/conexion.js'

export default function ConexionHoy() {
  const { interacciones, config } = usarApp()
  if (!config.gamificacionActiva) return null

  const balance = balanceReciente(interacciones, 7)
  const hoy = conexionHoy(interacciones)
  const mensaje = mensajeConexion(hoy, balance.brillo)

  // El brillo se traduce en cuántos corazones se "encienden".
  const corazones = Math.round(balance.brillo * 5)

  return (
    <TarjetaBase>
      <div className="flex items-center justify-between">
        <p className="font-titulo font-bold text-texto">✨ Conexión de hoy</p>
        <div className="flex gap-0.5" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="text-sm transition-opacity"
              style={{ opacity: i < corazones ? 1 : 0.2 }}
            >
              💗
            </span>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-texto-2">{mensaje}</p>
      {balance.nublado && (
        <p className="mt-1 text-xs text-texto-3">
          Un detalle hoy ayudaría a despejar el cielo 🌤️
        </p>
      )}
    </TarjetaBase>
  )
}
