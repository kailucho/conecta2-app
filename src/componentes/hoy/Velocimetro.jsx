// RADAR DE PELIGROSIDAD 📡 — firma visual del modo él. Ícono + título/subtítulo
// en fila, score con ícono de clima, línea divisora y 3 chips con insignia de
// color (energía/sensibilidad/antojos). "Del día, no de ella 😅": es una guía
// con humor, NO un juicio sobre la pareja, su personalidad ni su ciclo.
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import EncabezadoSeccion from './EncabezadoSeccion.jsx'
import GaugePronostico from './GaugePronostico.jsx'
import FilaChipsPronostico from './FilaChipsPronostico.jsx'
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
    <TarjetaBase className="!border-t-4 !border-t-acento pt-5 shadow-xl">
      <div className="mb-1 flex items-center gap-3">
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

      <div className="flex items-center gap-4 py-2">
        <GaugePronostico score={score} clima={clima} etiqueta={etiquetaCorta} />
        <p className="flex-1 text-sm text-texto-2">{mensaje}</p>
      </div>

      <hr className="my-4 border-t border-borde/70" />

      <EncabezadoSeccion className="mb-2">Detalle del día</EncabezadoSeccion>
      <FilaChipsPronostico
        energia={pronostico.energia}
        sensibilidad={pronostico.sensibilidad}
        molestias={molestias}
      />

      <p className="mt-3 text-center text-[11px] leading-snug text-texto-3">
        {aclaracionRadar()}
      </p>
    </TarjetaBase>
  )
}
