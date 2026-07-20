// Chat del SOS. Con IA activada se vuelve conversacional (análisis, gravedad
// con humor, plan y disculpa redactada). Sin IA, usa el fallback estático con
// los protocolos y el detector de nubarrón.
import { useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { askAI } from '../../servicios/aiService.js'

export default function ChatSOS({ escenario }) {
  const { perfil } = usarApp()
  const [texto, setTexto] = useState('')
  const [respuesta, setRespuesta] = useState(null)
  const [fuente, setFuente] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function enviar() {
    if (!texto.trim()) return
    setCargando(true)
    const r = await askAI('sos_chat', {
      mensajeUsuario: texto.trim(),
      escenario: escenario?.id,
      tono: perfil.tonoHumor,
    })
    setRespuesta(r.texto)
    setFuente(r.fuente)
    setCargando(false)
  }

  return (
    <div className="space-y-2">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Cuéntame qué pasó, con tus palabras…"
        rows={3}
        className="w-full resize-none rounded-xl border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
      />
      <button
        onClick={enviar}
        disabled={cargando || !texto.trim()}
        className="w-full rounded-pill bg-acento py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {cargando ? 'Pensando…' : 'Pedir ayuda'}
      </button>

      {respuesta && (
        <div className="animate-aparecer rounded-xl bg-tarjeta-hover p-3">
          <p className="whitespace-pre-line text-sm text-texto">{respuesta}</p>
          {fuente === 'fallback' && (
            <p className="mt-2 text-xs text-texto-3">
              💡 Modo sin conexión: guía rápida. Activa la IA en Ajustes para un
              análisis más personalizado.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
