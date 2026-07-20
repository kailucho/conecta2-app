// Barra de navegación inferior con 4 pestañas. Botones ≥44px, con resaltado del
// acento del tema activo. La Guía vive dentro de "Más" (no ocupa pestaña).

const PESTANAS = [
  { id: 'hoy', icono: '🏠', label: 'Hoy' },
  { id: 'mes', icono: '📅', label: 'Mes' },
  { id: 'nosotros', icono: '💑', label: 'Nosotros' },
  { id: 'ajustes', icono: '⚙️', label: 'Más' },
]

export default function NavegacionInferior({ activa, alCambiar }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-borde bg-fondo-2/95 backdrop-blur area-segura-abajo"
      style={{ boxShadow: '0 -6px 20px -12px rgba(0,0,0,0.4)' }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {PESTANAS.map((p) => {
          const activo = activa === p.id
          return (
            <li key={p.id} className="flex-1">
              <button
                onClick={() => alCambiar(p.id)}
                aria-label={p.label}
                aria-current={activo ? 'page' : undefined}
                className="flex min-h-touch w-full flex-col items-center gap-0.5 px-1 py-2 transition-colors"
              >
                <span
                  className={`text-xl transition-transform ${
                    activo ? 'scale-110' : 'opacity-70'
                  }`}
                >
                  {p.icono}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    activo ? 'text-acento' : 'text-texto-3'
                  }`}
                >
                  {p.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
