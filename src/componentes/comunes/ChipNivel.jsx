// Chip con el nivel y los puntos del usuario. Abre el Centro de Conexión. Se
// oculta si la gamificación está desactivada.
import { useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { calcularNivel } from '../../motor/gamificacion.js'
import { nombresNiveles } from '../../datos/lenguaje.js'
import CentroConexion from '../gamificacion/CentroConexion.jsx'

const EMOJIS_NIVEL = ['🌱', '📘', '⭐', '🏆']

export default function ChipNivel() {
  const { perfil, gamificacion, config } = usarApp()
  const [abierto, setAbierto] = useState(false)
  if (!config.gamificacionActiva) return null

  const nivel = calcularNivel(gamificacion.puntos)
  const nombres = nombresNiveles(perfil.rol, perfil.tipoRelacion)

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1.5 rounded-pill border border-borde bg-tarjeta px-3 py-1.5"
      >
        <span>{EMOJIS_NIVEL[nivel]}</span>
        <span className="text-xs font-bold text-texto">{nombres[nivel]}</span>
        <span className="text-xs text-acento">· {gamificacion.puntos}</span>
      </button>
      <CentroConexion abierto={abierto} alCerrar={() => setAbierto(false)} />
    </>
  )
}
