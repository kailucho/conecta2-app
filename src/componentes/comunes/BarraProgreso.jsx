// Barra de progreso simple con etiqueta y valor opcional.
export default function BarraProgreso({
  valor = 0,
  max = 100,
  etiqueta,
  emoji,
  colorBarra = 'var(--tema-acento)',
  mostrarValor = false,
}) {
  const pct = Math.max(0, Math.min(100, (valor / max) * 100))
  return (
    <div>
      {(etiqueta || mostrarValor) && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-texto-2">
            {emoji && <span className="mr-1">{emoji}</span>}
            {etiqueta}
          </span>
          {mostrarValor && (
            <span className="font-semibold text-texto-3">
              {Math.round(valor)}
              {max === 100 ? '%' : `/${max}`}
            </span>
          )}
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-borde">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: colorBarra }}
        />
      </div>
    </div>
  )
}
