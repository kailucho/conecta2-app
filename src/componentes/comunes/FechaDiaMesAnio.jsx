import { useEffect, useId, useState } from 'react'
import {
  crearFechaISO,
  descomponerFechaISO,
  esFechaISOValida,
  MESES,
} from '../../motor/fechas.js'

const DIAS = Array.from({ length: 31 }, (_, indice) => String(indice + 1))
const CANTIDAD_ANIOS_RECIENTES = 16

function estadoInicial(value) {
  return esFechaISOValida(value)
    ? descomponerFechaISO(value)
    : { dia: '', mes: '', anio: '' }
}

/**
 * Selector accesible de fecha de calendario. Hacia afuera conserva el formato
 * ISO AAAA-MM-DD, pero presenta los controles en orden Día, Mes y Año.
 */
export default function FechaDiaMesAnio({
  value = '',
  onChange,
  onEstadoCambio,
  max,
  error,
  disabled = false,
}) {
  const [partes, setPartes] = useState(() => estadoInicial(value))
  const anioReferencia = /^\d{4}-/.test(max || '')
    ? Number(max.slice(0, 4))
    : new Date().getFullYear()
  const aniosRecientes = Array.from(
    { length: CANTIDAD_ANIOS_RECIENTES },
    (_, indice) => String(anioReferencia - indice),
  )
  const [modoOtroAnio, setModoOtroAnio] = useState(
    () => Boolean(partes.anio && !aniosRecientes.includes(partes.anio)),
  )
  const idBase = useId()
  const idError = `${idBase}-error`

  useEffect(() => {
    if (esFechaISOValida(value)) {
      const siguientes = descomponerFechaISO(value)
      setPartes(siguientes)
      setModoOtroAnio(!aniosRecientes.includes(siguientes.anio))
    }
  }, [value])

  function cambiarSelectorAnio(valor) {
    if (valor === 'otro') {
      setModoOtroAnio(true)
      actualizar('anio', '')
      return
    }
    setModoOtroAnio(false)
    actualizar('anio', valor)
  }

  function actualizar(campo, valor) {
    const siguientes = { ...partes, [campo]: valor }
    setPartes(siguientes)

    const completa = siguientes.dia && siguientes.mes && siguientes.anio
    if (!completa) {
      const vacia = !siguientes.dia && !siguientes.mes && !siguientes.anio
      onChange?.('', { estado: vacia ? 'vacia' : 'incompleta', partes: siguientes })
      onEstadoCambio?.(vacia ? 'vacia' : 'incompleta')
      return
    }

    const iso = crearFechaISO(siguientes.anio, siguientes.mes, siguientes.dia)
    if (!iso) {
      onChange?.('', { estado: 'invalida', partes: siguientes })
      onEstadoCambio?.('invalida')
      return
    }

    const estado = max && iso > max ? 'futura' : 'valida'
    onChange?.(iso, { estado, partes: siguientes })
    onEstadoCambio?.(estado)
  }

  const comun = `min-h-touch w-full rounded-card border bg-tarjeta px-3 py-3 text-texto outline-none focus:border-acento ${
    error ? 'border-peligro' : 'border-borde'
  } disabled:opacity-60`

  return (
    <div>
      <div className="grid grid-cols-[0.75fr_1.35fr_1fr] gap-2">
        <div>
          <label htmlFor={`${idBase}-dia`} className="mb-1 block text-sm font-semibold text-texto">
            Día
          </label>
          <select
            id={`${idBase}-dia`}
            value={partes.dia}
            onChange={(e) => actualizar('dia', e.target.value)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? idError : undefined}
            className={comun}
          >
            <option value="">—</option>
            {DIAS.map((dia) => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${idBase}-mes`} className="mb-1 block text-sm font-semibold text-texto">
            Mes
          </label>
          <select
            id={`${idBase}-mes`}
            value={partes.mes}
            onChange={(e) => actualizar('mes', e.target.value)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? idError : undefined}
            className={comun}
          >
            <option value="">—</option>
            {MESES.map((nombre, indice) => {
              const numero = String(indice + 1).padStart(2, '0')
              return (
                <option key={numero} value={numero}>
                  {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
                </option>
              )
            })}
          </select>
        </div>

        <div>
          <label htmlFor={`${idBase}-anio`} className="mb-1 block text-sm font-semibold text-texto">
            Año
          </label>
          <select
            id={`${idBase}-anio`}
            value={modoOtroAnio ? 'otro' : partes.anio}
            onChange={(e) => cambiarSelectorAnio(e.target.value)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? idError : undefined}
            className={comun}
          >
            <option value="">Elige</option>
            {aniosRecientes.map((anio) => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
            <option value="otro">Otro año…</option>
          </select>
        </div>
      </div>
      {modoOtroAnio && (
        <div className="mt-3">
          <label
            htmlFor={`${idBase}-otro-anio`}
            className="mb-1 block text-sm font-semibold text-texto"
          >
            Escribe el año
          </label>
          <input
            id={`${idBase}-otro-anio`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={partes.anio}
            onChange={(e) => actualizar('anio', e.target.value.replace(/\D/g, '').slice(0, 4))}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? idError : undefined}
            className={comun}
          />
          <p className="mt-1 text-xs text-texto-3">
            Usa esta opción si el año no aparece en la lista.
          </p>
        </div>
      )}
      {error && (
        <p id={idError} role="alert" className="mt-2 text-sm text-peligro">
          {error}
        </p>
      )}
    </div>
  )
}
