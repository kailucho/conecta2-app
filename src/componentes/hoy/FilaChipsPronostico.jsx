// FilaChipsPronostico — fila de 3 chips (Energía/Sensibilidad/Antojos) que
// acompaña al pronóstico del día. Compartida por Velocimetro.jsx y
// ClimaInterno.jsx.
import ChipDato from './ChipDato.jsx'

export default function FilaChipsPronostico({ energia, sensibilidad, molestias = [] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <ChipDato icono="⚡" etiqueta="Energía" valor={energia} color="acento" />
      <ChipDato icono="💗" etiqueta="Sensibilidad" valor={sensibilidad} color="peligro" />
      <ChipDato
        icono="🧁"
        etiqueta="Antojos"
        valor={molestias.length > 0 ? 'posibles' : 'sin datos'}
        color="morado"
      />
    </div>
  )
}
