// GaugePronostico — medidor circular (arco de 270°) que da protagonismo al
// score del pronóstico del día. Reemplaza el bloque plano "emoji + n/10" de
// Velocimetro.jsx y ClimaInterno.jsx por una pieza "hero" compartida.
//
// El arco usa var(--tema-acento) tomado por Tailwind (currentColor via
// text-acento), así se adapta solo a modo Esposo/Esposa. Respeta "reducir
// movimiento": sin transición de barrido si está activo.
import { usarApp } from '../../contexto/AppContexto.jsx'

const RADIO = 42
const INICIO = 135 // grados: arco de 270° centrado abajo
const BARRIDO = 270
const CIRCUNFERENCIA = 2 * Math.PI * RADIO
const ARCO_TOTAL = (BARRIDO / 360) * CIRCUNFERENCIA

function puntoEnArco(gradosDesdeInicio) {
  const angulo = ((INICIO + gradosDesdeInicio) * Math.PI) / 180
  return {
    x: 50 + RADIO * Math.cos(angulo),
    y: 50 + RADIO * Math.sin(angulo),
  }
}

export default function GaugePronostico({ score, clima, etiqueta, sufijo = '/10' }) {
  const { config } = usarApp()
  const reducirMovimiento = config?.reducirMovimiento

  const fraccion = Math.min(Math.max(score, 0), 10) / 10
  const progresoArco = ARCO_TOTAL * fraccion
  const inicio = puntoEnArco(0)
  const fin = puntoEnArco(BARRIDO)

  return (
    <div className="relative mx-auto flex h-[132px] w-[132px] shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-0" aria-hidden="true">
        {/* Pista de fondo */}
        <path
          d={`M ${inicio.x} ${inicio.y} A ${RADIO} ${RADIO} 0 1 1 ${fin.x} ${fin.y}`}
          fill="none"
          stroke="currentColor"
          className="text-borde"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progreso */}
        <path
          d={`M ${inicio.x} ${inicio.y} A ${RADIO} ${RADIO} 0 1 1 ${fin.x} ${fin.y}`}
          fill="none"
          stroke="currentColor"
          className={`text-acento ${reducirMovimiento ? '' : 'transition-[stroke-dasharray] duration-700 ease-out'}`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progresoArco} ${ARCO_TOTAL}`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl leading-none" aria-hidden="true">{clima}</span>
        <p className="mt-1 font-titulo text-2xl font-extrabold leading-none text-texto">
          {score}
          <span className="text-sm font-bold text-texto-3">{sufijo}</span>
        </p>
        {etiqueta && (
          <p className="mt-0.5 max-w-[90px] truncate text-[11px] font-bold text-acento">{etiqueta}</p>
        )}
      </div>
    </div>
  )
}
