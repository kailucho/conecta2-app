// ============================================================
// GraficoAnimoPorFase — muestra el ánimo observado agrupado por fase.
// Estado vacío inteligente: si aún hay pocos registros, muestra un patrón
// TEÓRICO "estimado" y una barra de "precisión del perfil" que sube con los
// registros reales. Nunca afirma que el ánimo lo causan las hormonas.
// ============================================================

import TarjetaBase from '../comunes/TarjetaBase.jsx'
import BarraProgreso from '../comunes/BarraProgreso.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { CONTENIDO_FASES } from '../../datos/tiposFase.js'

const ORDEN = ['menstrual', 'folicular', 'ovulacion', 'lutea']

// Patrón teórico estimado por fase (solo como referencia inicial).
const ESTIMADO = {
  menstrual: { emoji: '😴', texto: 'Más tranquila / cansada' },
  folicular: { emoji: '😄', texto: 'Con energía y ánimo' },
  ovulacion: { emoji: '🥰', texto: 'Radiante y sociable' },
  lutea: { emoji: '😌', texto: 'Más sensible o calmada' },
}

// Emoji más frecuente de un arreglo.
function moda(emojis) {
  const conteo = {}
  let mejor = null
  let max = 0
  for (const e of emojis) {
    conteo[e] = (conteo[e] || 0) + 1
    if (conteo[e] > max) {
      max = conteo[e]
      mejor = e
    }
  }
  return mejor
}

export default function GraficoAnimoPorFase() {
  const { animoObservado } = usarApp()
  const total = animoObservado.length

  // Agrupa por fase.
  const porFase = {}
  for (const f of ORDEN) porFase[f] = []
  for (const a of animoObservado) {
    if (porFase[a.fase]) porFase[a.fase].push(a.emoji)
  }

  // Precisión: crece con registros reales (tope a 20 registros = 100%).
  const precision = Math.min(100, Math.round((total / 20) * 100))
  const pocosDatos = total < 4

  return (
    <TarjetaBase>
      <p className="mb-1 font-titulo font-bold text-texto">📊 Ánimo por fase</p>
      <p className="mb-3 text-xs text-texto-3">
        {pocosDatos
          ? 'Aún hay pocos registros: te muestro un estimado. Se vuelve tuyo mientras registras.'
          : 'Basado en lo que has ido registrando. Es una guía, no una regla.'}
      </p>

      <div className="mb-4">
        <BarraProgreso
          valor={precision}
          max={100}
          etiqueta="Precisión de tu perfil"
          mostrarValor
        />
      </div>

      <div className="space-y-2">
        {ORDEN.map((f) => {
          const registros = porFase[f]
          const c = CONTENIDO_FASES[f]
          const usarEstimado = registros.length === 0
          const emoji = usarEstimado ? ESTIMADO[f].emoji : moda(registros)
          const texto = usarEstimado
            ? ESTIMADO[f].texto + ' (estimado)'
            : `${registros.length} ${registros.length === 1 ? 'registro' : 'registros'}`
          return (
            <div
              key={f}
              className="flex items-center gap-3 rounded-xl bg-tarjeta-hover p-2"
            >
              <span className="text-xl">{c.meta.emoji}</span>
              <span className="flex-1 text-sm text-texto-2">Fase {c.meta.nombre}</span>
              <span className="text-lg">{emoji}</span>
              <span className="w-24 text-right text-xs text-texto-3">{texto}</span>
            </div>
          )
        })}
      </div>
    </TarjetaBase>
  )
}
