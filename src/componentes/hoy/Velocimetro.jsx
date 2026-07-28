// RADAR DE PELIGROSIDAD 📡 — firma visual del modo él. Ícono + título/subtítulo
// en fila, score con ícono de clima, línea divisora y 3 chips con insignia de
// color (energía/sensibilidad/antojos). "Del día, no de ella 😅": es una guía
// con humor, NO un juicio sobre la pareja, su personalidad ni su ciclo.
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { mensajeRadar, aclaracionRadar } from '../../datos/radarPeligrosidad.js'

const NIVEL_TEXTUAL_CORTO = {
  tranquilo: 'Tranquilo',
  antenas: 'Antenas arriba',
  mimos: 'Moderado',
  delicada: 'Elevado',
  legendario: 'Legendario',
}

export default function Velocimetro({ pronostico, tono, semilla = 0 }) {
  const { nivel: score, nivelId, clima, molestias = [] } = pronostico
  const etiquetaCorta = NIVEL_TEXTUAL_CORTO[nivelId] || pronostico.nivelTextual
  const mensaje = mensajeRadar(nivelId, tono, semilla)

  return (
    <TarjetaBase className="ring-1 ring-acento/25">
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-acento/60 text-acento"
        >
          <span className="text-lg">📡</span>
        </span>
        <div>
          <p className="text-base font-black uppercase leading-tight tracking-wide text-texto">
            Radar de peligrosidad
          </p>
          <p className="text-xs font-semibold text-texto-3">Del día, no de ella 😅</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-5xl" aria-hidden="true">{clima}</span>
        <div>
          <p className="font-titulo text-2xl font-extrabold text-texto">
            {etiquetaCorta} <span className="text-acento">{score}/10</span>
          </p>
          <p className="mt-0.5 text-sm text-texto-2">{mensaje}</p>
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

      <p className="mt-3 text-center text-[11px] leading-snug text-texto-3">
        {aclaracionRadar()}
      </p>
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
