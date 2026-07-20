// Botón SOS flotante, siempre visible sobre la pantalla Hoy. Se sitúa por
// encima de la barra de comunicación (nav + barra) y mantiene su color de
// peligro, claramente diferenciado de las interacciones románticas.
export default function BotonSOS({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="SOS - ayuda con un conflicto"
      className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-peligro text-2xl shadow-xl transition-transform active:scale-90"
      style={{
        bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 6px 20px -4px var(--tema-danger)',
      }}
    >
      🚨
    </button>
  )
}
