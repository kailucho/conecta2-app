// EncabezadoSeccion — "eyebrow" reutilizable para títulos de sección: ícono +
// etiqueta en mayúsculas, con una acción opcional a la derecha (p.ej. "Ver
// más"). Unifica el estilo que antes se repetía suelto en cada tarjeta.
export default function EncabezadoSeccion({ icono, children, accion, alTocarAccion, className = '' }) {
  return (
    <div className={`mb-2 flex items-center justify-between px-1 ${className}`}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-texto-3">
        {icono && <span aria-hidden="true">{icono}</span>} {children}
      </p>
      {accion && (
        <button onClick={alTocarAccion} className="text-xs font-semibold text-acento">
          {accion}
        </button>
      )}
    </div>
  )
}
