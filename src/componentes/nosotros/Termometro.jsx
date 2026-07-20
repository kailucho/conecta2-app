// Termómetro de conexión semanal: 3 preguntas sí/no. Si el puntaje baja,
// avisa (anti-roommates) sin culpar a nadie.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import BarraProgreso from '../comunes/BarraProgreso.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { claveSemana } from '../../motor/fechas.js'
import { PREGUNTAS_TERMOMETRO } from '../../datos/ideasCitas.js'

export default function Termometro() {
  const { nosotros, actualizarNosotros } = usarApp()
  const semana = claveSemana()
  const registroSemana = (nosotros.termometro || []).find((t) => t.semana === semana)
  const [respuestas, setRespuestas] = useState(
    registroSemana?.respuestas || [null, null, null],
  )
  const guardado = !!registroSemana

  function responder(idx, valor) {
    if (guardado) return
    const nuevas = [...respuestas]
    nuevas[idx] = valor
    setRespuestas(nuevas)
  }

  async function guardar() {
    const score = respuestas.filter(Boolean).length
    const nuevo = { semana, respuestas, score, fecha: new Date().toISOString() }
    await actualizarNosotros({
      termometro: [nuevo, ...(nosotros.termometro || []).filter((t) => t.semana !== semana)],
    })
  }

  const score = respuestas.filter(Boolean).length
  const completo = respuestas.every((r) => r !== null)
  const nivelBajo = guardado && registroSemana.score <= 1

  return (
    <TarjetaBase>
      <p className="mb-1 font-titulo font-bold text-texto">
        🌡️ Termómetro de conexión
      </p>
      <p className="mb-3 text-xs text-texto-3">Esta semana ({semana})</p>

      <div className="space-y-3">
        {PREGUNTAS_TERMOMETRO.map((p, i) => (
          <div key={i}>
            <p className="mb-1 text-sm text-texto-2">{p}</p>
            <div className="flex gap-2">
              {[
                { v: true, label: 'Sí 😊' },
                { v: false, label: 'No 😕' },
              ].map((op) => (
                <button
                  key={String(op.v)}
                  onClick={() => responder(i, op.v)}
                  disabled={guardado}
                  className={`flex-1 rounded-pill border px-2 py-1.5 text-sm font-bold transition-all ${
                    respuestas[i] === op.v
                      ? 'border-acento bg-acento text-white'
                      : 'border-borde text-texto-2'
                  } ${guardado ? 'opacity-70' : ''}`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <BarraProgreso
          valor={score}
          max={3}
          etiqueta="Conexión de la semana"
          mostrarValor
          colorBarra={score <= 1 ? 'var(--tema-danger)' : 'var(--tema-success)'}
        />
      </div>

      {!guardado && completo && (
        <button
          onClick={guardar}
          className="mt-3 w-full rounded-pill bg-acento py-2.5 text-sm font-bold text-white active:scale-[0.98]"
        >
          Guardar
        </button>
      )}

      {nivelBajo && (
        <div className="mt-3 rounded-xl bg-peligro/10 p-3">
          <p className="text-sm font-bold text-peligro">
            ⚠️ Nivel roommate: peligroso
          </p>
          <p className="mt-1 text-sm text-texto-2">
            Esta semana estuvieron más en modo logística que en modo pareja. Un
            detalle o una cita chiquita puede reconectarlos 💙
          </p>
        </div>
      )}
      {guardado && !nivelBajo && (
        <p className="mt-3 text-center text-sm text-exito">
          ✓ Guardado. ¡Buen trabajo cuidándose! 💫
        </p>
      )}
    </TarjetaBase>
  )
}
