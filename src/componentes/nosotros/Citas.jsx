// Cita semanal (default Gottman): idea de la semana, cambiar idea, marcar
// cumplida (+puntos), y ajustar frecuencia semanal/quincenal.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarPuntos } from '../../contexto/usarPuntos.js'
import { claveSemana, diaDelAnio } from '../../motor/fechas.js'
import { convivenJuntos } from '../../datos/lenguaje.js'
import {
  IDEAS_CITAS_PRESENCIALES,
  IDEAS_CITAS_VIRTUALES,
} from '../../datos/ideasCitas.js'

export default function Citas() {
  const { perfil, nosotros, actualizarNosotros } = usarApp()
  const { otorgar } = usarPuntos()
  const conviven = convivenJuntos(perfil.tipoRelacion)
  const lista = conviven ? IDEAS_CITAS_PRESENCIALES : IDEAS_CITAS_VIRTUALES
  const [idx, setIdx] = useState(diaDelAnio() % lista.length)

  const semana = claveSemana()
  const citaSemana = (nosotros.citas || []).find((c) => c.semana === semana)
  const cumplida = citaSemana?.cumplida

  function otraIdea() {
    setIdx((i) => (i + 1) % lista.length)
  }

  async function marcarCumplida() {
    const nueva = {
      semana,
      idea: lista[idx].texto,
      cumplida: true,
      fecha: new Date().toISOString(),
    }
    await actualizarNosotros({
      citas: [nueva, ...(nosotros.citas || []).filter((c) => c.semana !== semana)],
    })
    await otorgar(30, `cita:${semana}`)
  }

  async function cambiarFrecuencia() {
    await actualizarNosotros({
      frecuenciaCitas:
        nosotros.frecuenciaCitas === 'semanal' ? 'quincenal' : 'semanal',
    })
  }

  const idea = lista[idx]

  return (
    <TarjetaBase>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-titulo font-bold text-texto">💑 Cita de la semana</p>
        <button
          onClick={cambiarFrecuencia}
          className="rounded-pill border border-borde px-2 py-1 text-xs text-texto-3"
        >
          {nosotros.frecuenciaCitas === 'quincenal' ? 'Quincenal' : 'Semanal'}
        </button>
      </div>

      {cumplida ? (
        <div className="rounded-xl bg-exito/10 p-4 text-center">
          <p className="font-titulo font-bold text-exito">
            ✓ ¡Cita cumplida esta semana!
          </p>
          <p className="text-sm text-texto-2">{citaSemana.idea}</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-tarjeta-hover p-4">
            <p className="text-2xl">{idea.emoji}</p>
            <p className="mt-1 text-texto">{idea.texto}</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={otraIdea}
              className="flex-1 rounded-pill border border-borde py-2 text-sm font-bold text-texto-2"
            >
              🔀 Otra idea
            </button>
            <button
              onClick={marcarCumplida}
              className="flex-1 rounded-pill bg-acento py-2 text-sm font-bold text-white active:scale-[0.98]"
            >
              ✓ La cumplimos
            </button>
          </div>
        </>
      )}
      <p className="mt-2 text-xs text-texto-3">
        Una cita cada semana mantiene viva la complicidad. 💙
      </p>
    </TarjetaBase>
  )
}
