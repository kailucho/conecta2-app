// Tip del día según la fase actual. Contenido de tiposFase.
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { tipDelDia } from '../../datos/tiposFase.js'

export default function TipDelDia({ faseId, semilla }) {
  const tip = tipDelDia(faseId, semilla)
  return (
    <TarjetaBase>
      <span className="text-xs font-bold uppercase tracking-wide text-acento">
        💡 Tip del día
      </span>
      <p className="mt-1.5 text-texto">{tip}</p>
    </TarjetaBase>
  )
}
