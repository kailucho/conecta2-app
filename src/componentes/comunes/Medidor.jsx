// Medidor de arco semicircular con aguja. Reutilizable para el velocímetro
// (modo él) y para medidores lineales del Clima Interno (modo ella).
// valor y max definen la posición de la aguja (0..max → 180°..0°).

function polar(cx, cy, r, anguloGrados) {
  const a = (anguloGrados * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }
}

// Genera un arco SVG entre dos ángulos (en grados, 0 = derecha, 180 = izq).
function arco(cx, cy, r, desde, hasta) {
  const ini = polar(cx, cy, r, desde)
  const fin = polar(cx, cy, r, hasta)
  const grande = Math.abs(hasta - desde) > 180 ? 1 : 0
  // barrido en sentido horario visualmente
  return `M ${ini.x} ${ini.y} A ${r} ${r} 0 ${grande} 1 ${fin.x} ${fin.y}`
}

export default function Medidor({ valor = 0, max = 10, etiqueta, sublabel, ariaLabel }) {
  const cx = 100
  const cy = 100
  const r = 78
  const pct = Math.max(0, Math.min(1, valor / max))
  // Aguja: 180° (izquierda) en 0, 0° (derecha) en max.
  const angulo = 180 - pct * 180
  const punta = polar(cx, cy, r - 14, angulo)

  return (
    <div
      className="relative flex flex-col items-center"
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 200 120" className="w-full max-w-[260px]" aria-hidden="true">
        <defs>
          <linearGradient id="medidorArco" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--tema-acento-fuerte)" />
            <stop offset="0.55" stopColor="var(--tema-acento)" />
            <stop offset="1" stopColor="var(--tema-brillo)" />
          </linearGradient>
        </defs>
        {/* Arco de fondo */}
        <path
          d={arco(cx, cy, r, 180, 0)}
          fill="none"
          stroke="var(--tema-border)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Arco de valor con gradiente y brillo del tema */}
        <path
          d={arco(cx, cy, r, 180, angulo)}
          fill="none"
          stroke="url(#medidorArco)"
          strokeWidth="14"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 7px var(--tema-brillo))' }}
        />
        {/* Aguja */}
        <line
          x1={cx}
          y1={cy}
          x2={punta.x}
          y2={punta.y}
          stroke="var(--tema-text-primary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="8" fill="var(--tema-text-primary)" />
        <circle cx={cx} cy={cy} r="4" fill="var(--tema-acento)" />
      </svg>
      <div className="-mt-4 text-center">
        <div className="font-titulo text-3xl font-extrabold text-texto">
          {valor}
          <span className="text-lg text-texto-3">/{max}</span>
        </div>
        {etiqueta && (
          <div className="text-sm font-semibold text-texto-2">{etiqueta}</div>
        )}
        {sublabel && <div className="text-xs text-texto-3">{sublabel}</div>}
      </div>
    </div>
  )
}
