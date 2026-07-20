// Tarjeta contenedora estándar con estilo del tema.
export default function TarjetaBase({ children, className = '', ...props }) {
  return (
    <div className={`tarjeta-tema p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
