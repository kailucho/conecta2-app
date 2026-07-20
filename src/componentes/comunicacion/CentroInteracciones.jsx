// ============================================================
// CentroInteracciones — bottom sheet progresivo con 4 categorías. Dueño de la
// máquina de estados del wizard: categorias → flujo → confirmacion. Reutiliza
// ModalHoja (accesible) y delega cada categoría en su Flujo*.
// ============================================================

import { useEffect, useState } from 'react'
import ModalHoja from '../comunes/ModalHoja.jsx'
import EscenaJuntos from '../personajes/EscenaJuntos.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import FlujoEmocion from './FlujoEmocion.jsx'
import FlujoNecesidad from './FlujoNecesidad.jsx'
import FlujoCarino from './FlujoCarino.jsx'
import FlujoJuntos from './FlujoJuntos.jsx'

const CATEGORIAS = [
  { id: 'emocion', emoji: '🫂', label: 'Cómo me siento' },
  { id: 'necesidad', emoji: '🙋', label: 'Necesito algo' },
  { id: 'carino', emoji: '💗', label: 'Quiero darte cariño' },
  { id: 'juntos', emoji: '🎯', label: 'Hagamos algo juntos' },
]

const TITULO_CATEGORIA = {
  emocion: 'Cómo me siento',
  necesidad: 'Necesito algo',
  carino: 'Quiero darte cariño',
  juntos: 'Hagamos algo juntos',
}

function Confirmacion({ datos, alCerrar }) {
  const { config } = usarApp()
  useEffect(() => {
    if (config.reducirMovimiento) return
    const t = setTimeout(alCerrar, 2600)
    return () => clearTimeout(t)
  }, [config.reducirMovimiento, alCerrar])

  return (
    <div className="space-y-3 py-2 text-center">
      {datos.escena ? (
        <EscenaJuntos puntosConexion={10} mensaje={datos.mensaje} />
      ) : (
        <>
          <div className="text-5xl">{datos.icono}</div>
          {datos.mensaje && <p className="text-sm text-texto-2">{datos.mensaje}</p>}
        </>
      )}
      <p className="font-titulo font-bold text-texto">{datos.titulo}</p>
      <button
        onClick={alCerrar}
        className="w-full rounded-pill bg-acento py-2.5 font-bold text-white"
      >
        Listo
      </button>
    </div>
  )
}

export default function CentroInteracciones({
  abierto,
  alCerrar,
  onReaccion,
  irA,
  alAbrirMensaje,
}) {
  const [paso, setPaso] = useState('categorias')
  const [categoria, setCategoria] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)

  // Al reabrir, siempre volver a la vista de categorías.
  useEffect(() => {
    if (abierto) {
      setPaso('categorias')
      setCategoria(null)
      setConfirmacion(null)
    }
  }, [abierto])

  function elegir(cat) {
    setCategoria(cat)
    setPaso('flujo')
  }
  function volver() {
    setCategoria(null)
    setPaso('categorias')
  }
  function confirmar(payload) {
    setConfirmacion(payload)
    setPaso('confirmacion')
  }

  const titulo =
    paso === 'confirmacion'
      ? '¡Listo!'
      : paso === 'flujo'
      ? TITULO_CATEGORIA[categoria]
      : '¿Qué quieres compartir?'

  const propsFlujo = {
    alConfirmar: confirmar,
    alVolver: volver,
    onReaccion,
  }

  return (
    <ModalHoja abierto={abierto} alCerrar={alCerrar} titulo={titulo}>
      {paso === 'categorias' && (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              onClick={() => elegir(c.id)}
              className="flex min-h-touch flex-col items-center gap-2 rounded-2xl border border-borde bg-tarjeta p-5 text-center transition-transform active:scale-95"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-sm font-semibold text-texto">{c.label}</span>
            </button>
          ))}
        </div>
      )}

      {paso === 'flujo' && categoria === 'emocion' && <FlujoEmocion {...propsFlujo} />}
      {paso === 'flujo' && categoria === 'necesidad' && <FlujoNecesidad {...propsFlujo} />}
      {paso === 'flujo' && categoria === 'carino' && (
        <FlujoCarino {...propsFlujo} alAbrirMensaje={alAbrirMensaje} />
      )}
      {paso === 'flujo' && categoria === 'juntos' && (
        <FlujoJuntos {...propsFlujo} irA={irA} alCerrar={alCerrar} />
      )}

      {paso === 'confirmacion' && confirmacion && (
        <Confirmacion datos={confirmacion} alCerrar={alCerrar} />
      )}
    </ModalHoja>
  )
}
