// ============================================================
// FondoDecorativo — capa decorativa (nubes, estrellas, destellos, puntos de
// luz) que enriquece el fondo de la pantalla Hoy sin afectar el layout ni el
// contenido. Es puramente visual: se dibuja detrás del contenido (z-index -1),
// es aria-hidden y respeta "reducir movimiento".
//
//   tema="ella" → universo rosado (nubes, destellos de 4 puntas, estrellitas)
//   tema="el"   → universo azul nocturno (estrellas, puntos cian)
// ============================================================

import { usarApp } from '../../contexto/AppContexto.jsx'

// Destello de 4 puntas (sparkle) reutilizable.
function Destello({ x, y, r, fill, opacity = 1 }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${r})`}
      d="M0 -1 C0.15 -0.3 0.3 -0.15 1 0 C0.3 0.15 0.15 0.3 0 1 C-0.15 0.3 -0.3 0.15 -1 0 C-0.3 -0.15 -0.15 -0.3 0 -1 Z"
      fill={fill}
      opacity={opacity}
    />
  )
}

// Estrella de 5 puntas pequeña.
function Estrella({ x, y, r, fill, opacity = 1 }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${r})`}
      d="M0 -1 L0.29 -0.31 L1 -0.31 L0.4 0.12 L0.62 0.81 L0 0.38 L-0.62 0.81 L-0.4 0.12 L-1 -0.31 L-0.29 -0.31 Z"
      fill={fill}
      opacity={opacity}
    />
  )
}

function Nube({ x, y, s, fill, opacity }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="34" ry="20" />
      <ellipse cx="-26" cy="6" rx="22" ry="15" />
      <ellipse cx="26" cy="6" rx="24" ry="16" />
      <rect x="-45" y="4" width="90" height="16" rx="8" />
    </g>
  )
}

function DecoElla({ animar }) {
  const parpadeo = animar ? 'deco-parpadeo' : ''
  const derivar = animar ? 'deco-derivar' : ''
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="blurElla" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Nubes suaves y difuminadas */}
      <g filter="url(#blurElla)" className={derivar}>
        <Nube x={70} y={70} s={1.1} fill="#ffffff" opacity={0.85} />
        <Nube x={330} y={130} s={0.9} fill="#ffffff" opacity={0.7} />
        <Nube x={40} y={430} s={0.8} fill="#ffffff" opacity={0.55} />
        <Nube x={360} y={520} s={1} fill="#ffffff" opacity={0.5} />
      </g>

      {/* Estrellas y destellos con colores del universo de ella */}
      <Destello x={200} y={60} r={9} fill="#ffd76a" className={parpadeo} />
      <g className={parpadeo}>
        <Destello x={150} y={110} r={5} fill="#ffb0cb" />
        <Destello x={300} y={230} r={7} fill="#ffd76a" opacity={0.9} />
        <Destello x={60} y={250} r={5} fill="#ddc8ff" opacity={0.8} />
        <Destello x={350} y={360} r={6} fill="#ffc9ad" />
      </g>
      <Estrella x={110} y={330} r={5} fill="#ffb0cb" opacity={0.8} />
      <Estrella x={330} y={430} r={6} fill="#ffd76a" opacity={0.85} />
      <Estrella x={70} y={600} r={5} fill="#ffc9ad" opacity={0.7} />
      <Estrella x={310} y={660} r={6} fill="#ddc8ff" opacity={0.6} />

      {/* Puntos de luz pequeños */}
      <circle cx="250" cy="150" r="2.5" fill="#ffffff" opacity="0.9" />
      <circle cx="120" cy="470" r="2" fill="#ffd76a" opacity="0.8" />
      <circle cx="280" cy="560" r="2.5" fill="#ffb0cb" opacity="0.8" />
      <circle cx="180" cy="700" r="2" fill="#ffffff" opacity="0.7" />
    </svg>
  )
}

function DecoEl({ animar }) {
  const parpadeo = animar ? 'deco-parpadeo' : ''
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      {/* Estrellas pequeñas dispersas */}
      <g className={parpadeo}>
        <Estrella x={200} y={60} r={6} fill="#83e4f2" opacity={0.9} />
        <Estrella x={90} y={140} r={4} fill="#2b95ff" opacity={0.8} />
        <Estrella x={320} y={220} r={5} fill="#ffd166" opacity={0.6} />
        <Estrella x={60} y={360} r={4} fill="#83e4f2" opacity={0.7} />
        <Estrella x={340} y={440} r={5} fill="#38d0f0" opacity={0.7} />
        <Estrella x={120} y={560} r={4} fill="#ffd166" opacity={0.5} />
        <Estrella x={300} y={650} r={5} fill="#83e4f2" opacity={0.6} />
      </g>

      {/* Destellos y puntos de luz */}
      <Destello x={150} y={110} r={6} fill="#38d0f0" opacity={0.7} />
      <Destello x={280} y={330} r={7} fill="#83e4f2" opacity={0.6} />
      <Destello x={80} y={500} r={5} fill="#2b95ff" opacity={0.6} />

      <circle cx="250" cy="180" r="1.8" fill="#bcd2e6" opacity="0.9" />
      <circle cx="130" cy="300" r="1.6" fill="#83e4f2" opacity="0.8" />
      <circle cx="330" cy="540" r="1.8" fill="#bcd2e6" opacity="0.7" />
      <circle cx="180" cy="680" r="1.6" fill="#38d0f0" opacity="0.7" />
      <circle cx="60" cy="620" r="1.6" fill="#bcd2e6" opacity="0.6" />
    </svg>
  )
}

export default function FondoDecorativo({ tema }) {
  const { config } = usarApp()
  const animar = !config.reducirMovimiento

  return (
    <div className="fondo-deco" aria-hidden="true">
      {tema === 'ella' ? <DecoElla animar={animar} /> : <DecoEl animar={animar} />}
    </div>
  )
}
