// ============================================================
// Astro Azul 💙 — personaje principal del modo él.
// Pequeño astro/planeta azul profundo con detalles cian, redondeado y
// expresivo. Expresiones cálidas y divertidas. Accesorios desbloqueables.
// ============================================================

import { EXPRESIONES } from '../../motor/expresiones.js'

function Ojos({ expresion }) {
  const ojoAbierto = (cx) => (
    <g key={cx}>
      <circle cx={cx} cy={112} r={11} fill="#f7fbff" />
      <circle cx={cx + 2} cy={113} r={5} fill="#071827" />
      <circle cx={cx + 4} cy={110} r={2} fill="#fff" />
    </g>
  )
  const ojoFeliz = (cx) => (
    <path
      key={cx}
      d={`M${cx - 11} 114 Q${cx} 102 ${cx + 11} 114`}
      fill="none"
      stroke="#f7fbff"
      strokeWidth="5"
      strokeLinecap="round"
    />
  )
  const ojoCerrado = (cx) => (
    <path
      key={cx}
      d={`M${cx - 10} 112 Q${cx} 118 ${cx + 10} 112`}
      fill="none"
      stroke="#f7fbff"
      strokeWidth="5"
      strokeLinecap="round"
    />
  )

  const izq = 112
  const der = 158
  switch (expresion) {
    case EXPRESIONES.feliz:
    case EXPRESIONES.radiante:
    case EXPRESIONES.amor:
      return <>{ojoFeliz(izq)}{ojoFeliz(der)}</>
    case EXPRESIONES.cansado:
    case EXPRESIONES.cueva:
      return <>{ojoCerrado(izq)}{ojoCerrado(der)}</>
    case EXPRESIONES.pensativo:
      return (
        <>
          {ojoAbierto(izq)}
          {ojoAbierto(der)}
          <path d="M100 96 Q112 90 124 96" fill="none" stroke="#83e4f2" strokeWidth="3" strokeLinecap="round" />
        </>
      )
    default:
      return <>{ojoAbierto(izq)}{ojoAbierto(der)}</>
  }
}

function Boca({ expresion }) {
  switch (expresion) {
    case EXPRESIONES.feliz:
    case EXPRESIONES.radiante:
      return <path d="M120 138 Q135 156 150 138" fill="#071827" stroke="#83e4f2" strokeWidth="2" />
    case EXPRESIONES.amor:
      return <path d="M122 140 Q135 150 148 140" fill="none" stroke="#f7fbff" strokeWidth="4" strokeLinecap="round" />
    case EXPRESIONES.sorpresa:
      return <ellipse cx="135" cy="142" rx="8" ry="10" fill="#071827" stroke="#83e4f2" strokeWidth="2" />
    case EXPRESIONES.cansado:
      return <path d="M124 142 Q135 138 146 142" fill="none" stroke="#f7fbff" strokeWidth="4" strokeLinecap="round" />
    case EXPRESIONES.cueva:
      return <line x1="124" y1="143" x2="146" y2="143" stroke="#f7fbff" strokeWidth="4" strokeLinecap="round" />
    case EXPRESIONES.pensativo:
      return <path d="M124 144 Q135 140 146 144" fill="none" stroke="#f7fbff" strokeWidth="4" strokeLinecap="round" />
    default:
      return <path d="M124 140 Q135 148 146 140" fill="none" stroke="#f7fbff" strokeWidth="4" strokeLinecap="round" />
  }
}

export default function AstroAzul({
  expresion = EXPRESIONES.neutral,
  tamano = 160,
  animar = true,
  accesorios = [],
}) {
  const cansado = expresion === EXPRESIONES.cansado || expresion === EXPRESIONES.cueva
  const flotando = animar && !cansado

  return (
    <svg
      viewBox="0 0 270 250"
      width={tamano}
      height={tamano}
      role="img"
      aria-label="Astro Azul"
      className={flotando ? 'animate-flotar-suave' : ''}
    >
      {/* Estrellitas de fondo */}
      {!cansado && (
        <g style={animar ? { animation: 'destello 2.4s ease-in-out infinite' } : {}}>
          <circle cx="40" cy="60" r="4" fill="#83e4f2" />
          <circle cx="225" cy="70" r="3" fill="#28c7e8" />
          <circle cx="210" cy="180" r="3.5" fill="#83e4f2" />
        </g>
      )}

      {/* Anillo del planeta */}
      <ellipse
        cx="135"
        cy="130"
        rx="115"
        ry="34"
        fill="none"
        stroke="#28c7e8"
        strokeWidth="9"
        opacity="0.85"
        transform="rotate(-16 135 130)"
      />

      {/* Cuerpo del planeta */}
      <circle cx="135" cy="130" r="78" fill="#168bff" />
      <circle cx="135" cy="130" r="78" fill="url(#brilloAstro)" opacity="0.25" />
      <defs>
        <radialGradient id="brilloAstro" cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#83e4f2" />
          <stop offset="1" stopColor="#006dd6" />
        </radialGradient>
      </defs>

      {/* Cráteres sutiles */}
      <circle cx="95" cy="165" r="10" fill="#006dd6" opacity="0.5" />
      <circle cx="170" cy="170" r="7" fill="#006dd6" opacity="0.5" />

      <Ojos expresion={expresion} />
      <Boca expresion={expresion} />

      {/* Accesorios desbloqueables */}
      {accesorios.includes('gorra') && (
        <path d="M80 78 Q135 40 190 78 L190 86 L80 86 Z" fill="#006dd6" />
      )}
      {accesorios.includes('lentes') && (
        <g stroke="#071827" strokeWidth="4" fill="none">
          <circle cx="112" cy="112" r="16" />
          <circle cx="158" cy="112" r="16" />
          <line x1="128" y1="112" x2="142" y2="112" />
        </g>
      )}

      {/* Adornos por expresión */}
      {cansado && <text x="195" y="80" fontSize="22" fill="#83e4f2">z</text>}
      {expresion === EXPRESIONES.amor && <text x="196" y="90" fontSize="24">💙</text>}
    </svg>
  )
}
