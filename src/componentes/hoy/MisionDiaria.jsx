// Misión diaria proactiva (+20 pts). Carga Mental si conviven, Atención si
// son novios a distancia. Al marcarla, suma puntos con anti-spam por día.
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { sumarPuntos } from '../../motor/gamificacion.js'
import { misionDelDia, claveMisionHecha } from '../../datos/misiones.js'
import { convivenJuntos } from '../../datos/lenguaje.js'

export default function MisionDiaria({ semilla }) {
  const { perfil, gamificacion, config, actualizarGamificacion } = usarApp()
  const conviven = convivenJuntos(perfil.tipoRelacion)
  const mision = misionDelDia(conviven, semilla)

  const claveHecha = claveMisionHecha(mision, semilla)
  const hecha = (gamificacion.misionesHechas || []).includes(claveHecha)

  async function completar() {
    if (hecha) return
    const nueva = { ...gamificacion }
    if (config.gamificacionActiva) {
      const res = sumarPuntos(nueva, mision.puntos, claveHecha)
      Object.assign(nueva, res.estado)
    }
    nueva.misionesHechas = [...(gamificacion.misionesHechas || []), claveHecha]
    await actualizarGamificacion(nueva)
  }

  return (
    <TarjetaBase>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-acento">
          🎯 {mision.titulo}
        </span>
        {config.gamificacionActiva && (
          <span className="text-xs font-bold text-texto-3">+{mision.puntos} pts</span>
        )}
      </div>
      <p className="mb-3 text-texto">{mision.texto}</p>
      <button
        onClick={completar}
        disabled={hecha}
        className={`w-full rounded-pill py-2.5 font-titulo text-sm font-bold transition-transform active:scale-[0.98] ${
          hecha
            ? 'bg-exito/20 text-exito'
            : 'bg-acento text-white'
        }`}
      >
        {hecha ? '✓ ¡Misión cumplida!' : 'Marcar como hecha'}
      </button>
    </TarjetaBase>
  )
}
