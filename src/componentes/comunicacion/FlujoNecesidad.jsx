// ============================================================
// FlujoNecesidad — "Necesito algo". Muestra primero 4 necesidades frecuentes y
// un "Ver más" con el resto. Reutiliza las acciones rápidas (type quick_action).
// ============================================================

import { useState } from 'react'
import { accionPorId } from '../../datos/accionesRapidas.js'
import { usarEnvioInteraccion } from './usarEnvioInteraccion.js'

// Necesidades concretas. Los estados emocionales (sin batería, estresado…) NO
// se duplican aquí: viven en "Cómo me siento". Los besitos, en "Darte cariño".
const FRECUENTES = ['abrazo', 'hambre', 'engreir', 'momento']
const ADICIONALES = ['antojo', 'meti_pata']

export default function FlujoNecesidad({ alConfirmar, alVolver, onReaccion }) {
  const enviarAccion = usarEnvioInteraccion()
  const [verMas, setVerMas] = useState(false)
  const [sel, setSel] = useState(null)
  const [nota, setNota] = useState('')

  const ids = verMas ? [...FRECUENTES, ...ADICIONALES] : FRECUENTES

  async function enviar(accion) {
    const resultado = await enviarAccion(accion, { nota })
    if (!resultado?.ok) return
    onReaccion?.(accion.expresion)
    alConfirmar({
      icono: accion.emoji,
      titulo: 'Aviso enviado',
      mensaje: `Le llegará: "${accion.notif}"`,
    })
  }

  // Sub-paso: confirmar (con nota opcional) la necesidad elegida.
  if (sel) {
    return (
      <div className="space-y-3 text-center">
        <div className="text-4xl">{sel.emoji}</div>
        <p className="font-titulo font-bold text-texto">{sel.label}</p>
        {sel.permiteNota && (
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota corta (opcional)…"
            maxLength={80}
            className="w-full rounded-pill border border-borde bg-tarjeta px-4 py-2.5 text-sm text-texto"
          />
        )}
        <button
          onClick={() => enviar(sel)}
          className="w-full rounded-pill bg-acento py-3 font-titulo font-bold text-white active:scale-[0.98]"
        >
          Enviar 💌
        </button>
        <button
          onClick={() => {
            setSel(null)
            setNota('')
          }}
          className="w-full text-center text-xs font-semibold text-texto-3"
        >
          ← Elegir otra
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-texto-2">¿Qué necesitas ahora?</p>
      <div className="grid grid-cols-2 gap-2">
        {ids.map((id) => {
          const a = accionPorId(id)
          if (!a) return null
          return (
            <button
              key={id}
              onClick={() => setSel(a)}
              className="flex min-h-touch flex-col items-center gap-1 rounded-xl border border-borde bg-tarjeta p-3 text-center transition-transform active:scale-95"
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-[11px] leading-tight text-texto-2">{a.label}</span>
            </button>
          )
        })}
      </div>
      {!verMas && (
        <button
          onClick={() => setVerMas(true)}
          className="w-full text-center text-sm font-semibold text-acento"
        >
          Ver más
        </button>
      )}
      <button
        onClick={alVolver}
        className="w-full text-center text-xs font-semibold text-texto-3"
      >
        ← Volver
      </button>
    </div>
  )
}
