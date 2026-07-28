// ChipDato — insignia compacta de un dato del pronóstico (Energía,
// Sensibilidad, Antojos). Compartido por Velocimetro.jsx y ClimaInterno.jsx
// para no duplicar el mismo markup/paleta en ambos.
const COLOR_BADGE = {
  acento: 'bg-acento/15 text-acento',
  peligro: 'bg-peligro/15 text-peligro',
  morado: 'bg-[#a78bfa]/15 text-[#a78bfa]',
}

export default function ChipDato({ icono, etiqueta, valor, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-borde bg-tarjeta-hover/40 px-2 py-3 text-center">
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 items-center justify-center rounded-full text-base ${COLOR_BADGE[color]}`}
      >
        {icono}
      </span>
      <span className="text-[11px] font-semibold text-texto-3">{etiqueta}</span>
      <span className="text-xs font-bold text-texto">{valor.charAt(0).toUpperCase() + valor.slice(1)}</span>
    </div>
  )
}
