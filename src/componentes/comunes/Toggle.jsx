// Interruptor on/off accesible para Ajustes.
export default function Toggle({ activo, onCambiar, etiqueta, descripcion, emoji }) {
  return (
    <button
      onClick={() => onCambiar(!activo)}
      role="switch"
      aria-checked={activo}
      className="flex min-h-touch w-full items-center gap-3 py-2 text-left"
    >
      {emoji && <span className="text-xl">{emoji}</span>}
      <span className="flex-1">
        <span className="block text-sm font-semibold text-texto">{etiqueta}</span>
        {descripcion && (
          <span className="block text-xs text-texto-3">{descripcion}</span>
        )}
      </span>
      <span
        className={`relative h-7 w-12 flex-none rounded-full transition-colors ${
          activo ? 'bg-acento' : 'bg-borde'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            activo ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}
