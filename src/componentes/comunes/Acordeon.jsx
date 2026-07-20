// Acordeón expandible reutilizable (Guía). Una sección abierta a la vez si se
// usa controlado, o independiente si no.
import { useState } from 'react'

export default function Acordeon({ titulo, subtitulo, emoji, children, colorBorde }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div
      className="overflow-hidden rounded-card border bg-tarjeta"
      style={{ borderColor: colorBorde || 'var(--tema-border)' }}
    >
      <button
        onClick={() => setAbierto((a) => !a)}
        className="flex min-h-touch w-full items-center gap-3 p-4 text-left"
      >
        {emoji && <span className="text-2xl">{emoji}</span>}
        <span className="flex-1">
          <span className="block font-titulo font-bold text-texto">{titulo}</span>
          {subtitulo && <span className="text-xs text-texto-3">{subtitulo}</span>}
        </span>
        <span
          className={`text-texto-3 transition-transform ${abierto ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      {abierto && (
        <div className="animate-aparecer border-t border-borde px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}
