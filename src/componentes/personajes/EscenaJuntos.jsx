// ============================================================
// EscenaJuntos — animación conjunta de AMBOS personajes cuando hay una
// interacción positiva (la pareja respondió con cariño, se cumplió un deseo,
// se respetó una necesidad, etc.).
//
// Hay varias variantes (abrazo, chocar manos, corazones, mitades de corazón,
// confeti, baile). Se elige una al azar sin repetir la anterior, para no
// aburrir. Muestra "+X conexión" brevemente.
// ============================================================

import { useMemo } from 'react'
import Estrellita from './Estrellita.jsx'
import AstroAzul from './AstroAzul.jsx'
import { EXPRESIONES } from '../../motor/expresiones.js'
import { usarApp } from '../../contexto/AppContexto.jsx'

const VARIANTES = [
  { id: 'abrazo', emoji: '🫂', texto: '¡Se abrazan!', expr: EXPRESIONES.tierno },
  { id: 'corazones', emoji: '💕', texto: 'Se lanzan corazones', expr: EXPRESIONES.amor },
  { id: 'choque', emoji: '🙌', texto: '¡Chocan manos!', expr: EXPRESIONES.feliz },
  { id: 'baile', emoji: '💃', texto: '¡A bailar!', expr: EXPRESIONES.radiante },
  { id: 'confeti', emoji: '🎉', texto: '¡Celebran juntos!', expr: EXPRESIONES.feliz },
  { id: 'mitades', emoji: '❤️', texto: 'Juntan su corazón', expr: EXPRESIONES.amor },
]

// Recuerda la última variante mostrada para no repetirla seguida.
let ultimaVariante = null

function elegirVariante() {
  let candidatas = VARIANTES.filter((v) => v.id !== ultimaVariante)
  if (candidatas.length === 0) candidatas = VARIANTES
  const v = candidatas[Math.floor(Math.random() * candidatas.length)]
  ultimaVariante = v.id
  return v
}

export default function EscenaJuntos({ puntosConexion = 10, mensaje }) {
  const { config } = usarApp()
  const animar = !config.reducirMovimiento
  const variante = useMemo(() => elegirVariante(), [])

  return (
    <div
      className="flex flex-col items-center rounded-card p-2 text-center"
      style={{ animation: animar ? 'reaccion-pop 0.4s ease-out' : 'none' }}
    >
      <div className="relative flex items-end justify-center">
        <div className={animar ? 'animate-flotar-suave' : ''}>
          <AstroAzul expresion={variante.expr} tamano={92} animar={animar} />
        </div>
        <span className="mx-[-8px] mb-6 text-2xl">{variante.emoji}</span>
        <div className={animar ? 'animate-flotar-suave' : ''}>
          <Estrellita expresion={variante.expr} tamano={92} animar={animar} />
        </div>
      </div>
      <p className="mt-1 font-titulo font-bold text-texto">{variante.texto}</p>
      {mensaje && <p className="text-sm text-texto-2">{mensaje}</p>}
      <span className="mt-1 rounded-pill bg-exito/20 px-3 py-1 text-xs font-bold text-exito">
        +{puntosConexion} conexión 💫
      </span>
    </div>
  )
}
