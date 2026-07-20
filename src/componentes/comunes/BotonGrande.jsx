// Botón táctil grande (≥44px). Variantes de color según intención.
export default function BotonGrande({
  children,
  variante = 'primario',
  className = '',
  ...props
}) {
  const estilos = {
    primario:
      'bg-acento text-white shadow-lg active:scale-[0.98] disabled:opacity-50',
    suave:
      'bg-tarjeta border border-borde text-texto active:scale-[0.98] disabled:opacity-50',
    peligro:
      'bg-peligro text-white active:scale-[0.98] disabled:opacity-50',
    fantasma:
      'bg-transparent text-acento active:opacity-70',
  }[variante]

  return (
    <button
      className={`min-h-touch rounded-pill px-5 py-3 text-center font-titulo text-base font-bold transition-transform ${estilos} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
