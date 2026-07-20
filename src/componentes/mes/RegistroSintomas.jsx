// Registro de síntomas para la etapa menopausia (bochornos, sueño, ánimo),
// con intensidad 1-3. Se guarda en ciclo.sintomasMenopausia.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { claveDia } from '../../motor/fechas.js'
import { SINTOMAS_MENOPAUSIA } from '../../datos/etapasVida.js'

const INTENSIDADES = [
  { v: 1, label: 'Leve' },
  { v: 2, label: 'Medio' },
  { v: 3, label: 'Fuerte' },
]

export default function RegistroSintomas() {
  const { ciclo, actualizarCiclo } = usarApp()
  const [tipo, setTipo] = useState('bochornos')
  const [intensidad, setIntensidad] = useState(2)
  const [ok, setOk] = useState(false)

  async function registrar() {
    const nuevo = {
      fecha: claveDia(new Date()),
      tipo,
      intensidad,
    }
    await actualizarCiclo({
      sintomasMenopausia: [nuevo, ...(ciclo.sintomasMenopausia || [])].slice(0, 200),
    })
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }

  const historialHoy = (ciclo.sintomasMenopausia || []).filter(
    (s) => s.fecha === claveDia(new Date()),
  )

  return (
    <TarjetaBase>
      <p className="mb-2 font-titulo font-bold text-texto">
        Registrar síntoma de hoy
      </p>
      <div className="mb-3 flex gap-2">
        {SINTOMAS_MENOPAUSIA.map((s) => (
          <button
            key={s.id}
            onClick={() => setTipo(s.id)}
            className={`flex-1 rounded-xl border p-2 text-sm transition-all ${
              tipo === s.id ? 'border-acento bg-tarjeta-hover' : 'border-borde'
            }`}
          >
            <span className="block text-lg">{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>
      <div className="mb-3 flex gap-2">
        {INTENSIDADES.map((i) => (
          <button
            key={i.v}
            onClick={() => setIntensidad(i.v)}
            className={`flex-1 rounded-pill border px-2 py-1.5 text-xs font-bold transition-all ${
              intensidad === i.v
                ? 'border-acento bg-acento text-white'
                : 'border-borde text-texto-2'
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>
      <button
        onClick={registrar}
        className="w-full rounded-pill bg-acento py-2.5 font-titulo text-sm font-bold text-white active:scale-[0.98]"
      >
        {ok ? '✓ Guardado' : 'Guardar síntoma'}
      </button>
      {historialHoy.length > 0 && (
        <p className="mt-2 text-xs text-texto-3">
          Hoy registraste {historialHoy.length}{' '}
          {historialHoy.length === 1 ? 'síntoma' : 'síntomas'}.
        </p>
      )}
    </TarjetaBase>
  )
}
