// Traductor Esposa-Español / Esposo-Español. Escribes lo que dijo tu pareja y
// la app explica qué significa, cómo responder y un nivel de gravedad.
// Con IA usa el modelo; sin IA, el diccionario estático.
import { useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { askAI } from '../../servicios/aiService.js'
import { detectarNubarronEstatico, NUBARRONES } from '../../datos/nubarrones.js'
import { comoLlamarPareja } from '../../datos/lenguaje.js'

export default function Traductor() {
  const { perfil } = usarApp()
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState(null)
  const [fuente, setFuente] = useState(null)
  const [cargando, setCargando] = useState(false)

  // El rol de la pareja es el opuesto al mío.
  const rolPareja = perfil.rol === 'el' ? 'ella' : 'el'

  async function traducir() {
    if (!texto.trim()) return
    setCargando(true)
    const r = await askAI('traductor', {
      mensajeUsuario: texto.trim(),
      rolPareja,
    })
    setResultado(r.texto)
    setFuente(r.fuente)
    setCargando(false)
  }

  const nubarron = texto ? detectarNubarronEstatico(texto) : null

  return (
    <div className="space-y-2">
      <p className="text-sm text-texto-2">
        Escribe lo que dijo {comoLlamarPareja(perfil.rol, perfil.tipoRelacion)} y
        te ayudo a descifrarlo 🕵️
      </p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder='Ej. "haz lo que quieras"'
        rows={2}
        className="w-full resize-none rounded-xl border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
      />
      <button
        onClick={traducir}
        disabled={cargando || !texto.trim()}
        className="w-full rounded-pill bg-acento py-2.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {cargando ? 'Traduciendo…' : 'Traducir'}
      </button>

      {nubarron && (
        <div className="rounded-xl bg-peligro/10 p-2 text-xs text-peligro">
          Cuidado: eso puede sonar a {NUBARRONES[nubarron].emoji}{' '}
          {NUBARRONES[nubarron].nombre}.
        </div>
      )}

      {resultado && (
        <div className="animate-aparecer rounded-xl bg-tarjeta-hover p-3">
          <p className="whitespace-pre-line text-sm text-texto">{resultado}</p>
          {fuente === 'fallback' && (
            <p className="mt-2 text-xs text-texto-3">
              💡 Diccionario offline. Activa la IA en Ajustes para traducciones
              más finas.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
