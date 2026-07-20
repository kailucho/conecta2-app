// Velocímetro de "peligrosidad" — firma visual del modo él. Arco con aguja,
// score X/10 y frase con humor según fase y tono. Es una guía con humor, NO
// un juicio sobre la pareja.
import Medidor from '../comunes/Medidor.jsx'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { fraseCabecera } from '../../datos/tiposFase.js'

export default function Velocimetro({ fase, score, tono, zonaRoja }) {
  const frase = fraseCabecera(fase.id, tono)

  return (
    <TarjetaBase className="flex flex-col items-center">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-texto-3">
        Nivel del día
      </p>
      <Medidor valor={score} max={10} etiqueta={`Fase ${fase.nombre}`} />
      <p className="mt-2 text-center font-titulo text-lg font-bold text-texto">
        {frase}
      </p>
      {zonaRoja && (
        <span className="mt-2 rounded-pill bg-peligro/15 px-3 py-1 text-xs font-bold text-peligro">
          🔴 Zona Roja · máxima ternura
        </span>
      )}
    </TarjetaBase>
  )
}
