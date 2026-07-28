// Pronóstico de bienestar — firma visual del modo ella. En vez de
// "peligrosidad", usa lenguaje de autoconocimiento: ícono + título/subtítulo
// en fila, score con ícono de clima, línea divisora, chips con insignia de
// color y un botón de un tap para avisarle a la pareja.
//
// NUNCA afirma que las emociones son causadas obligatoriamente por hormonas.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
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
    <TarjetaBase className="ring-1 ring-acento/25">
      <div className="mb-4 flex items-center gap-3">
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

      <div className="flex items-center gap-4">
        <span className="text-5xl" aria-hidden="true">{clima}</span>
        <div>
          <p className="font-titulo text-2xl font-extrabold text-texto">
            {etiquetaCorta} <span className="text-acento">{score}/10</span>
          </p>
          <p className="mt-0.5 text-sm text-texto-2">{frase}</p>
        </div>
      </div>

      <hr className="my-4 border-t border-borde/70" />

      <div className="grid grid-cols-3 gap-2">
        <ChipDato icono="⚡" etiqueta="Energía" valor={pronostico.energia} color="acento" />
        <ChipDato icono="💗" etiqueta="Sensibilidad" valor={pronostico.sensibilidad} color="peligro" />
        <ChipDato
          icono="🧁"
          etiqueta="Antojos"
          valor={molestias.length > 0 ? 'posibles' : 'sin datos'}
          color="morado"
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

const COLOR_BADGE = {
  acento: 'bg-acento/15 text-acento',
  peligro: 'bg-peligro/15 text-peligro',
  morado: 'bg-[#a78bfa]/15 text-[#a78bfa]',
}

function ChipDato({ icono, etiqueta, valor, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-borde bg-tarjeta-hover/40 px-2 py-3 text-center">
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 items-center justify-center rounded-full text-base ${COLOR_BADGE[color]}`}
      >
        {icono}
      </span>
      <span className="text-[11px] font-semibold text-texto-3">{etiqueta}</span>
      <span className="text-xs font-bold text-texto">{valor.charAt(0).toUpperCase() + valor.slice(1)}</span>
    </div>
  )
}
