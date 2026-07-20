// RADAR DE PELIGROSIDAD 📡 — firma visual del modo él. Arco con aguja, score
// X/10, nivel y mensaje con humor. "Del día, no de ella 😅": es una guía con
// humor, NO un juicio sobre la pareja, su personalidad ni su ciclo.
import Medidor from '../comunes/Medidor.jsx'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { mensajeRadar, aclaracionRadar } from '../../datos/radarPeligrosidad.js'

export default function Velocimetro({ radar, fase, tono, semilla = 0 }) {
  const { score, nivel, mostrarFase } = radar
  const mensaje = mensajeRadar(nivel.id, tono, semilla)
  const etiqueta = mostrarFase && fase ? `Fase ${fase.nombre}` : nivel.estado

  return (
    <TarjetaBase className="flex flex-col items-center">
      <p className="mb-0.5 text-center text-lg font-black uppercase tracking-wide text-acento">
        Radar de peligrosidad
      </p>
      <p className="mb-2 text-center text-xs font-semibold text-texto-3">
        Del día, no de ella 😅
      </p>

      <Medidor
        valor={score}
        max={10}
        etiqueta={etiqueta}
        sublabel={`${nivel.emoji} ${nivel.estado}`}
        ariaLabel={`Radar de peligrosidad: ${score} de 10, ${nivel.estado}`}
      />

      <p className="mt-2 text-center font-titulo text-lg font-bold text-texto">
        {nivel.emoji} {nivel.idea}
      </p>
      <p className="mt-1 text-center text-sm text-texto-2">{mensaje}</p>

      <p className="mt-3 text-center text-[11px] leading-snug text-texto-3">
        {aclaracionRadar()}
      </p>
    </TarjetaBase>
  )
}
