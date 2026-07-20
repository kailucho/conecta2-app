// ============================================================
// FlujoJuntos — "Hagamos algo juntos". Propuestas de plan (quick_action), la
// misión del día (se completa in situ) y accesos a deseos/metas en Nosotros.
// ============================================================

import { accionPorId } from '../../datos/accionesRapidas.js'
import { usarMision } from '../../contexto/usarMision.js'
import { usarEnvioInteraccion } from './usarEnvioInteraccion.js'

const PLANES = ['cita', 'pelicula', 'salir_comer']

export default function FlujoJuntos({ alConfirmar, alVolver, onReaccion, irA, alCerrar }) {
  const enviarAccion = usarEnvioInteraccion()
  const { mision, hecha, completar } = usarMision()

  async function proponer(id) {
    const a = accionPorId(id)
    if (!a) return
    const resultado = await enviarAccion(a)
    if (!resultado?.ok) return
    onReaccion?.(a.expresion)
    alConfirmar({
      icono: a.emoji,
      titulo: '¡Propuesta enviada!',
      mensaje: `Le llegará: "${a.notif}"`,
      escena: true,
    })
  }

  async function completarMision() {
    await completar()
    onReaccion?.('feliz')
    alConfirmar({ icono: '🎯', titulo: '¡Misión cumplida!', mensaje: `+${mision.puntos} pts 💫` })
  }

  function irANosotros() {
    alCerrar?.()
    irA?.('nosotros')
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-texto-2">¿Qué hacemos juntos?</p>

      <div className="grid grid-cols-3 gap-2">
        {PLANES.map((id) => {
          const a = accionPorId(id)
          if (!a) return null
          return (
            <button
              key={id}
              onClick={() => proponer(id)}
              className="flex min-h-touch flex-col items-center gap-1 rounded-xl border border-borde bg-tarjeta p-3 text-center transition-transform active:scale-95"
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-[11px] leading-tight text-texto-2">{a.label}</span>
            </button>
          )
        })}
      </div>

      {/* Misión del día */}
      <div className="rounded-xl border border-borde bg-tarjeta p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-acento">
          🎯 {mision.titulo}
        </p>
        <p className="mb-2 mt-1 text-sm text-texto-2">{mision.texto}</p>
        <button
          onClick={completarMision}
          disabled={hecha}
          className={`w-full rounded-pill py-2 text-xs font-bold transition-transform active:scale-[0.98] ${
            hecha ? 'bg-exito/20 text-exito' : 'bg-acento text-white'
          }`}
        >
          {hecha ? '✓ ¡Misión cumplida!' : `Realizar misión (+${mision.puntos})`}
        </button>
      </div>

      {/* Accesos a Nosotros */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={irANosotros}
          className="rounded-xl border border-borde bg-tarjeta p-3 text-center text-sm text-texto transition-transform active:scale-95"
        >
          ✨ Agregar un deseo
        </button>
        <button
          onClick={irANosotros}
          className="rounded-xl border border-borde bg-tarjeta p-3 text-center text-sm text-texto transition-transform active:scale-95"
        >
          🎯 Meta de pareja
        </button>
      </div>

      <button
        onClick={alVolver}
        className="w-full text-center text-xs font-semibold text-texto-3"
      >
        ← Volver
      </button>
    </div>
  )
}
