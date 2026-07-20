// Detector de Manías 🧦 con rachas estilo Duolingo. Es un juego liviano y
// cariñoso, NUNCA una herramienta para reclamar. Marcar una manía suma a su
// racha del día; mantener días seguidos crece la racha.
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { claveDia } from '../../motor/fechas.js'
import { convivenJuntos } from '../../datos/lenguaje.js'
import { listaManias } from '../../datos/manias.js'

export default function DetectorManias() {
  const { perfil, gamificacion, actualizarGamificacion } = usarApp()
  const conviven = convivenJuntos(perfil.tipoRelacion)
  const manias = listaManias(conviven)
  const rachas = gamificacion.rachas || {}
  const hoy = claveDia(new Date())

  async function marcar(id) {
    const actual = rachas[id] || { dias: 0, ultimaFecha: null }
    if (actual.ultimaFecha === hoy) return // ya marcada hoy

    // Racha continua si la última fue ayer; si no, reinicia a 1.
    const ayer = claveDia(new Date(Date.now() - 86400000))
    const nuevaRacha =
      actual.ultimaFecha === ayer ? actual.dias + 1 : 1

    await actualizarGamificacion({
      rachas: { ...rachas, [id]: { dias: nuevaRacha, ultimaFecha: hoy } },
    })
  }

  return (
    <TarjetaBase>
      <p className="mb-1 font-titulo font-bold text-texto">🧦 Detector de Manías</p>
      <p className="mb-3 text-xs text-texto-3">
        Un juego liviano, con cariño. Marca la manía del día y sube la racha 😄
      </p>

      <div className="grid grid-cols-1 gap-2">
        {manias.map((m) => {
          const r = rachas[m.id]
          const marcadaHoy = r?.ultimaFecha === hoy
          return (
            <button
              key={m.id}
              onClick={() => marcar(m.id)}
              disabled={marcadaHoy}
              className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                marcadaHoy ? 'border-acento bg-tarjeta-hover' : 'border-borde'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="flex-1 text-sm text-texto-2">{m.texto}</span>
              {r?.dias > 0 && (
                <span className="rounded-pill bg-alerta/20 px-2 py-0.5 text-xs font-bold text-alerta">
                  🔥 {r.dias}
                </span>
              )}
              {marcadaHoy && <span className="text-exito">✓</span>}
            </button>
          )
        })}
      </div>
    </TarjetaBase>
  )
}
