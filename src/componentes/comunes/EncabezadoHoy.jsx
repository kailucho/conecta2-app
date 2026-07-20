// Encabezado de la pantalla Hoy: saludo, fecha, día del ciclo, fase y chip de
// nivel. Respeta la privacidad: en modo él, si la pareja restringió la info,
// no siempre se muestra la fase (se filtra desde la pantalla Hoy).
import { fechaLarga } from '../../motor/fechas.js'
import ChipNivel from './ChipNivel.jsx'
import IndicadorConexion from './IndicadorConexion.jsx'

export default function EncabezadoHoy({ fase, dia, mostrarFase = true, saludo }) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm capitalize text-texto-3">{fechaLarga(new Date())}</p>
        <h1 className="font-titulo text-2xl font-extrabold text-texto">
          {saludo}
        </h1>
        {mostrarFase && fase && (
          <p className="mt-0.5 text-sm text-texto-2">
            Día {dia} · {fase.emoji} Fase {fase.nombre}
            {fase.retraso && ' (con retraso)'}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <ChipNivel />
        <IndicadorConexion />
      </div>
    </header>
  )
}
