// Patrón semanal del ánimo observado de la pareja. Con datos suficientes,
// detecta si hay un día de la semana que se repite como "bajón" (ej. "los
// domingos por la noche"). Es una observación suave, nunca un veredicto.
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { aMedianoche, DIAS_SEMANA } from '../../motor/fechas.js'

// Emojis considerados "bajón" para detectar patrón.
const BAJON = new Set(['😠', '😢', '😔', '🕳️', '😤'])

export default function PatronSemanal() {
  const { animoObservado } = usarApp()

  if (animoObservado.length < 6) {
    return (
      <TarjetaBase>
        <p className="font-titulo font-bold text-texto">🔎 Su patrón semanal</p>
        <p className="mt-1 text-sm text-texto-2">
          Sigue registrando su ánimo unos días y acá aparecerá si hay algún día
          que se le hace cuesta arriba 💙
        </p>
      </TarjetaBase>
    )
  }

  // Cuenta bajones por día de semana.
  const porDia = Array(7).fill(0)
  const totalPorDia = Array(7).fill(0)
  for (const a of animoObservado) {
    const d = aMedianoche(a.fecha).getDay()
    totalPorDia[d] += 1
    if (BAJON.has(a.emoji)) porDia[d] += 1
  }

  // Día con más bajones (con al menos 2 para afirmar algo).
  let diaMax = -1
  let max = 1
  for (let i = 0; i < 7; i++) {
    if (porDia[i] > max) {
      max = porDia[i]
      diaMax = i
    }
  }

  return (
    <TarjetaBase>
      <p className="font-titulo font-bold text-texto">🔎 Su patrón semanal</p>
      {diaMax >= 0 ? (
        <p className="mt-1 text-sm text-texto-2">
          Parece que los <strong className="text-texto">{DIAS_SEMANA[diaMax]}s</strong> suele
          andar más bajón. Puede ser el finde que se acaba, el estrés del
          trabajo o mil cosas — un detallito ese día podría caerle bien 💙
        </p>
      ) : (
        <p className="mt-1 text-sm text-texto-2">
          Por ahora no se ve un día que se repita más que otros. ¡Buena señal de
          equilibrio!
        </p>
      )}
    </TarjetaBase>
  )
}
