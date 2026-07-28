// Pronóstico de bienestar — firma visual del modo ella. En vez de
// "peligrosidad", usa lenguaje de autoconocimiento: ícono + título/subtítulo
// en fila, score con ícono de clima, línea divisora, chips con insignia de
// color y un botón de un tap para avisarle a la pareja.
//
// NUNCA afirma que las emociones son causadas obligatoriamente por hormonas.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import EncabezadoSeccion from './EncabezadoSeccion.jsx'
import GaugePronostico from './GaugePronostico.jsx'
import FilaChipsPronostico from './FilaChipsPronostico.jsx'
import { fraseCabecera } from '../../datos/tiposFase.js'

const NIVEL_TEXTUAL_CORTO = {
  tranquilo: 'Tranquilo',
  antenas: 'Antenas arriba',
  mimos: 'Moderado',
  delicada: 'Elevado',
  legendario: 'Legendario',
}

export default function ClimaInterno({ pronostico, tono, onAvisar }) {
  const [avisado, setAvisado] = useState(false)
  const { nivel: score, nivelId, clima, molestias = [] } = pronostico
  const etiquetaCorta = NIVEL_TEXTUAL_CORTO[nivelId] || pronostico.nivelTextual
  const frase = pronostico.fase ? fraseCabecera(pronostico.fase.id, tono) : pronostico.recomendacionAutocuidado

  function avisar() {
    setAvisado(true)
    onAvisar?.()
    setTimeout(() => setAvisado(false), 3000)
  }

  return (
    <TarjetaBase className="!border-t-4 !border-t-acento pt-5 shadow-xl">
      <div className="mb-1 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-acento/60 text-acento"
        >
          <span className="text-lg">🌤️</span>
        </span>
        <p className="text-base font-black uppercase leading-tight tracking-wide text-texto">
          Pronóstico de bienestar
        </p>
      </div>

      <div className="flex items-center gap-4 py-2">
        <GaugePronostico score={score} clima={clima} etiqueta={etiquetaCorta} />
        <p className="flex-1 text-sm text-texto-2">{frase}</p>
      </div>

      <hr className="my-4 border-t border-borde/70" />

      <EncabezadoSeccion className="mb-2">Detalle del día</EncabezadoSeccion>
      <FilaChipsPronostico
        energia={pronostico.energia}
        sensibilidad={pronostico.sensibilidad}
        molestias={molestias}
      />

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
