// Metas de pareja con barras de progreso (viaje, ahorro, negocio, etc.).
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import BarraProgreso from '../comunes/BarraProgreso.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { generarId } from '../../servicios/storageService.js'

export default function Metas() {
  const { nosotros, actualizarNosotros } = usarApp()
  const metas = nosotros.metas || []
  const [nuevo, setNuevo] = useState('')

  async function agregar() {
    if (!nuevo.trim()) return
    const meta = { id: generarId(), titulo: nuevo.trim(), progreso: 0, meta: 100 }
    await actualizarNosotros({ metas: [...metas, meta] })
    setNuevo('')
  }

  async function ajustar(id, delta) {
    await actualizarNosotros({
      metas: metas.map((m) =>
        m.id === id
          ? { ...m, progreso: Math.max(0, Math.min(100, m.progreso + delta)) }
          : m,
      ),
    })
  }

  async function eliminar(id) {
    await actualizarNosotros({ metas: metas.filter((m) => m.id !== id) })
  }

  return (
    <TarjetaBase>
      <p className="mb-3 font-titulo font-bold text-texto">🎯 Metas de pareja</p>

      <div className="space-y-4">
        {metas.map((m) => (
          <div key={m.id}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-texto">{m.titulo}</span>
              <button
                onClick={() => eliminar(m.id)}
                className="text-xs text-texto-3"
                aria-label="Eliminar meta"
              >
                ✕
              </button>
            </div>
            <BarraProgreso valor={m.progreso} max={100} mostrarValor />
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => ajustar(m.id, -10)}
                className="flex-1 rounded-pill border border-borde py-1 text-sm text-texto-2"
              >
                −10%
              </button>
              <button
                onClick={() => ajustar(m.id, 10)}
                className="flex-1 rounded-pill bg-acento/20 py-1 text-sm font-bold text-acento"
              >
                +10%
              </button>
            </div>
            {m.progreso >= 100 && (
              <p className="mt-1 text-center text-xs font-bold text-exito">
                🎉 ¡Meta cumplida! Grandes 💫
              </p>
            )}
          </div>
        ))}
        {metas.length === 0 && (
          <p className="text-sm text-texto-3">
            Aún no hay metas. Agreguen una: un viaje, un ahorro, un proyecto…
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Nueva meta (ej. viaje a Cusco)"
          className="flex-1 rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
        />
        <button
          onClick={agregar}
          className="rounded-pill bg-acento px-4 py-2 text-sm font-bold text-white"
        >
          +
        </button>
      </div>
    </TarjetaBase>
  )
}
