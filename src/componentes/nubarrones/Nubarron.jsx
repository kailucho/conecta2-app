// Nubarrón gris con carita — antagonista del universo de mascotas. Animación
// de "aparición" y de "derrota" (al aplicar el antídoto).
import { useState } from 'react'

export default function Nubarron({ color = '#7892a7', emoji, tamano = 90, derrotado = false }) {
  return (
    <svg
      viewBox="0 0 120 100"
      width={tamano}
      height={tamano * 0.83}
      role="img"
      aria-label="Nubarrón"
      style={{
        animation: derrotado ? 'none' : 'flotar-suave 3s ease-in-out infinite',
        opacity: derrotado ? 0.35 : 1,
        filter: derrotado ? 'grayscale(1)' : 'none',
        transition: 'opacity 0.4s, filter 0.4s',
      }}
    >
      {/* Cuerpo de nube */}
      <g fill={color}>
        <ellipse cx="45" cy="60" rx="30" ry="24" />
        <ellipse cx="75" cy="58" rx="28" ry="22" />
        <ellipse cx="60" cy="45" rx="26" ry="22" />
        <rect x="28" y="60" width="66" height="18" rx="9" />
      </g>
      {/* Rayo si es el Crítico/tormenta */}
      {!derrotado && (
        <path d="M58 78 l-6 12 6 -2 -4 12 12 -16 -6 2 4 -10z" fill="#ffd166" />
      )}
      {/* Carita enojona */}
      <circle cx="50" cy="52" r="4" fill="#2b3640" />
      <circle cx="70" cy="52" r="4" fill="#2b3640" />
      <path
        d="M46 44 l10 4 M74 44 l-10 4"
        stroke="#2b3640"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {derrotado ? (
        <path d="M52 66 q8 5 16 0" fill="none" stroke="#2b3640" strokeWidth="2.5" strokeLinecap="round" />
      ) : (
        <path d="M52 68 q8 -6 16 0" fill="none" stroke="#2b3640" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {emoji && <text x="90" y="30" fontSize="18">{emoji}</text>}
    </svg>
  )
}

// Tarjeta interactiva del nubarrón: muestra ejemplos y "derrota" al ver el antídoto.
export function TarjetaNubarron({ nubarron }) {
  const [derrotado, setDerrotado] = useState(false)
  return (
    <div className="rounded-card border border-borde bg-tarjeta p-4">
      <div className="flex items-center gap-3">
        <Nubarron color={nubarron.color} emoji={nubarron.emoji} derrotado={derrotado} tamano={80} />
        <div>
          <p className="font-titulo text-lg font-bold text-texto">
            {nubarron.emoji} {nubarron.nombre}
          </p>
          <p className="text-xs text-texto-3">{nubarron.ataca}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-bold uppercase text-texto-3">Suena así:</p>
        <ul className="mt-1 space-y-1 text-sm text-texto-2">
          {nubarron.ejemplos.map((e, i) => (
            <li key={i}>• {e}</li>
          ))}
        </ul>
      </div>

      {!derrotado ? (
        <button
          onClick={() => setDerrotado(true)}
          className="mt-3 w-full rounded-pill bg-acento py-2 text-sm font-bold text-white active:scale-[0.98]"
        >
          🌱 Ver el antídoto
        </button>
      ) : (
        <div className="mt-3 animate-aparecer rounded-xl bg-exito/10 p-3">
          <p className="text-sm font-bold text-exito">Antídoto: {nubarron.antidoto}</p>
          <p className="mt-1 text-sm text-texto-2">{nubarron.antidotoEjemplo}</p>
        </div>
      )}
    </div>
  )
}
