// Generador de mensajes cariñosos según fase y contexto. Con IA genera uno a
// medida; sin IA usa la biblioteca de frases por fase.
import { useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarCiclo } from '../../contexto/usarCiclo.js'
import { askAI } from '../../servicios/aiService.js'

export default function GeneradorMensajes() {
  const { perfil } = usarApp()
  const ciclo = usarCiclo()
  const [contexto, setContexto] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [fuente, setFuente] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  async function generar() {
    setCargando(true)
    const r = await askAI('mensaje_carinoso', {
      fase: ciclo.fase?.id || 'folicular',
      tono: perfil.tonoHumor,
      mensajeUsuario: contexto.trim() || null,
    })
    setMensaje(r.texto)
    setFuente(r.fuente)
    setCargando(false)
    setCopiado(false)
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    } catch {
      /* algunos navegadores lo bloquean */
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-texto-2">
        ¿No sabes qué escribirle? Te doy una idea linda 💌
      </p>
      <input
        value={contexto}
        onChange={(e) => setContexto(e.target.value)}
        placeholder="Contexto opcional (ej. tuvo un día difícil)"
        className="w-full rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
      />
      <button
        onClick={generar}
        disabled={cargando}
        className="w-full rounded-pill bg-acento py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {cargando ? 'Pensando…' : mensaje ? 'Otra idea 🔀' : 'Generar mensaje'}
      </button>

      {mensaje && (
        <div className="animate-aparecer rounded-xl bg-tarjeta-hover p-3">
          <p className="text-sm text-texto">"{mensaje}"</p>
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={copiar}
              className="rounded-pill bg-acento/20 px-3 py-1 text-xs font-bold text-acento"
            >
              {copiado ? '✓ Copiado' : '📋 Copiar'}
            </button>
            {fuente === 'fallback' && (
              <span className="text-xs text-texto-3">Biblioteca offline</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
