// Clima Interno — firma visual del modo ella. En vez de "peligrosidad", usa
// lenguaje de autoconocimiento y 3 medidores (sensibilidad, paciencia,
// energía). Incluye botón de un tap para avisarle a la pareja.
//
// NUNCA afirma que las emociones son causadas obligatoriamente por hormonas.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import BarraProgreso from '../comunes/BarraProgreso.jsx'
import { fraseCabecera } from '../../datos/tiposFase.js'

// Estimación suave de medidores por fase (0-100). Es orientativo, no una regla.
const MEDIDORES_POR_FASE = {
  menstrual: { sensibilidad: 70, paciencia: 45, energia: 30 },
  folicular: { sensibilidad: 35, paciencia: 75, energia: 80 },
  ovulacion: { sensibilidad: 30, paciencia: 80, energia: 95 },
  lutea: { sensibilidad: 75, paciencia: 40, energia: 45 },
}

const CLIMAS = {
  menstrual: 'Clima: nublado y tranquilo 🌧️ — tu cuerpo pide descanso.',
  folicular: 'Clima: despejado y con energía 🌤️',
  ovulacion: 'Clima: soleado y radiante ☀️',
  lutea: 'Clima: variable 🌦️ — puede que estés más sensible, y está bien.',
}

export default function ClimaInterno({ fase, tono, zonaRoja, onAvisar }) {
  const [avisado, setAvisado] = useState(false)
  const m = MEDIDORES_POR_FASE[fase.id]
  const frase = fraseCabecera(fase.id, tono)

  function avisar() {
    setAvisado(true)
    onAvisar?.()
    setTimeout(() => setAvisado(false), 3000)
  }

  return (
    <TarjetaBase>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-acento">
        Tu clima interno
      </p>
      <p className="font-titulo text-lg font-bold text-texto">{CLIMAS[fase.id]}</p>
      <p className="mb-4 mt-1 text-sm text-texto-2">{frase}</p>

      <div className="space-y-3">
        <BarraProgreso
          etiqueta="Sensibilidad"
          emoji="💗"
          valor={m.sensibilidad}
          colorBarra="var(--tema-acento)"
        />
        <BarraProgreso
          etiqueta="Paciencia"
          emoji="🌿"
          valor={m.paciencia}
          colorBarra="var(--tema-success)"
        />
        <BarraProgreso
          etiqueta="Energía"
          emoji="🔋"
          valor={m.energia}
          colorBarra="var(--tema-warning)"
        />
      </div>

      <p className="mt-3 text-xs text-texto-3">
        Esto es solo una guía. Tú te conoces mejor que cualquier cálculo 💗
      </p>

      <button
        onClick={avisar}
        disabled={avisado}
        className="btn-acento mt-4 w-full rounded-pill px-4 py-3 font-titulo text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {avisado ? '✓ Le avisamos 💗' : 'Amor, ando sensible, no es contigo 💙'}
      </button>
    </TarjetaBase>
  )
}
