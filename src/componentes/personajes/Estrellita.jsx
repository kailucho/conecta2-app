// ============================================================
// Estrellita 💗 — personaje principal del modo ella.
// Estrella amarilla pastel con bordes rosados/anaranjados, mejillas rosadas,
// ojos y boca animables, brillos alrededor. Reemplaza a cualquier nube como
// personaje principal (las nubes solo decoran fondos).
//
// La prop `expresion` viene del motor de expresiones. Cada expresión ajusta
// ojos, boca, mejillas y adornos. Respeta "reducir movimiento" (las clases de
// animación se neutralizan por CSS global).
// ============================================================

import { EXPRESIONES } from '../../motor/expresiones.js'

// Ojos según expresión. Devuelve JSX de los dos ojos.
function Ojos({ expresion }) {
  const ojoAbierto = (cx) => (
    <g key={cx}>
      <circle cx={cx} cy={104} r={10} fill="#49233a" />
      <circle cx={cx + 3} cy={100} r={3.2} fill="#fff" />
    </g>
  )
  const ojoFeliz = (cx) => (
    <path
      key={cx}
      d={`M${cx - 10} 106 Q${cx} 96 ${cx + 10} 106`}
      fill="none"
      stroke="#49233a"
      strokeWidth="5"
      strokeLinecap="round"
    />
  )
  const ojoCerrado = (cx) => (
    <path
      key={cx}
      d={`M${cx - 9} 104 Q${cx} 110 ${cx + 9} 104`}
      fill="none"
      stroke="#49233a"
      strokeWidth="5"
      strokeLinecap="round"
    />
  )
  const ojoCorazon = (cx) => (
    <path
      key={cx}
      d={`M${cx} 112 C${cx - 10} 100 ${cx - 10} 92 ${cx - 4} 94 C${cx - 1} 95 ${cx} 98 ${cx} 99 C${cx} 98 ${cx + 1} 95 ${cx + 4} 94 C${cx + 10} 92 ${cx + 10} 100 ${cx} 112 Z`}
      fill="#ff5f93"
    />
  )

  const izq = 108
  const der = 152

  switch (expresion) {
    case EXPRESIONES.feliz:
    case EXPRESIONES.radiante:
      return <>{ojoFeliz(izq)}{ojoFeliz(der)}</>
    case EXPRESIONES.cansado:
      return <>{ojoCerrado(izq)}{ojoCerrado(der)}</>
    case EXPRESIONES.amor:
      return <>{ojoCorazon(izq)}{ojoCorazon(der)}</>
    case EXPRESIONES.sensible:
      return (
        <>
          {ojoAbierto(izq)}
          {ojoAbierto(der)}
          {/* lagrimita sutil */}
          <circle cx={izq - 8} cy={116} r={3} fill="#b8dfff" />
        </>
      )
    case EXPRESIONES.cueva:
      return <>{ojoCerrado(izq)}{ojoCerrado(der)}</>
    default:
      return <>{ojoAbierto(izq)}{ojoAbierto(der)}</>
  }
}

// Boca según expresión.
function Boca({ expresion }) {
  switch (expresion) {
    case EXPRESIONES.feliz:
    case EXPRESIONES.radiante:
      return <path d="M118 130 Q130 148 142 130" fill="#ff5f93" stroke="#49233a" strokeWidth="3" />
    case EXPRESIONES.amor:
      return <path d="M120 132 Q130 144 140 132" fill="none" stroke="#49233a" strokeWidth="4" strokeLinecap="round" />
    case EXPRESIONES.sorpresa:
      return <ellipse cx="130" cy="134" rx="8" ry="10" fill="#ff5f93" stroke="#49233a" strokeWidth="3" />
    case EXPRESIONES.cansado:
      return <path d="M120 134 Q130 130 140 134" fill="none" stroke="#49233a" strokeWidth="4" strokeLinecap="round" />
    case EXPRESIONES.sensible:
      return <path d="M120 136 Q130 128 140 136" fill="none" stroke="#49233a" strokeWidth="4" strokeLinecap="round" />
    case EXPRESIONES.tierno:
      return <path d="M121 131 Q130 140 139 131" fill="none" stroke="#49233a" strokeWidth="4" strokeLinecap="round" />
    default:
      return <path d="M122 131 Q130 138 138 131" fill="none" stroke="#49233a" strokeWidth="4" strokeLinecap="round" />
  }
}

export default function Estrellita({
  expresion = EXPRESIONES.neutral,
  tamano = 160,
  animar = true,
}) {
  const radiante = expresion === EXPRESIONES.radiante
  const cansado = expresion === EXPRESIONES.cansado || expresion === EXPRESIONES.cueva
  const flotando = animar && !cansado

  return (
    <svg
      viewBox="0 0 260 240"
      width={tamano}
      height={tamano}
      role="img"
      aria-label="Estrellita"
      className={flotando ? 'animate-flotar-suave' : ''}
    >
      {/* Brillos alrededor (más si está radiante, menos si cansada) */}
      {!cansado && (
        <g style={animar ? { animation: 'destello 2s ease-in-out infinite' } : {}}>
          <path d="M40 60 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#ffd76a" />
          <path d="M215 50 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#ff5f93" />
          {radiante && (
            <path d="M215 175 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#ffd76a" />
          )}
        </g>
      )}

      {/* Cuerpo de estrella */}
      <path
        d="M130 40l26 54 59 7-44 40 12 59-53-31-53 31 12-59-44-40 59-7z"
        fill="#ffd76a"
        stroke="#ff5f93"
        strokeWidth="7"
        strokeLinejoin="round"
        opacity={cansado ? 0.85 : 1}
      />

      {/* Mejillas */}
      <circle cx="98" cy="124" r="12" fill="#ffaac4" opacity={radiante ? 0.95 : 0.7} />
      <circle cx="162" cy="124" r="12" fill="#ffaac4" opacity={radiante ? 0.95 : 0.7} />

      <Ojos expresion={expresion} />
      <Boca expresion={expresion} />

      {/* Adornos por expresión */}
      {cansado && (
        <text x="170" y="70" fontSize="22" fill="#80546a" className={animar ? 'animate-flotar-suave' : ''}>
          z
        </text>
      )}
      {expresion === EXPRESIONES.amor && (
        <text x="175" y="80" fontSize="24">💗</text>
      )}
      {expresion === EXPRESIONES.tierno && (
        <text x="176" y="150" fontSize="22">💗</text>
      )}
    </svg>
  )
}
