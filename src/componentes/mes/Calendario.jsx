// ============================================================
// Calendario mensual con SOLO 3 estados visuales: normal / fértil / Zona Roja.
// Al tocar un día se muestra el detalle completo de fase. Navegación por mes.
//
// La privacidad se respeta en la pantalla contenedora; aquí se pinta lo que se
// permite mostrar.
// ============================================================

import { useState } from 'react'
import {
  diaCicloProyectado,
  obtenerFase,
  esZonaRoja,
  esDiaFertil,
} from '../../motor/motorCiclo.js'
import { claveDia, mesYAnio, fechaLarga } from '../../motor/fechas.js'
import { contenidoFase } from '../../datos/tiposFase.js'

const DIAS_CORTO = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export default function Calendario({ fechaUltima, config, modoFertilidad }) {
  const [refMes, setRefMes] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [diaSel, setDiaSel] = useState(null)

  const anio = refMes.getFullYear()
  const mes = refMes.getMonth()
  const primerDiaSemana = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const hoyKey = claveDia(new Date())

  // Construye la matriz de celdas (con huecos al inicio).
  const celdas = []
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(new Date(anio, mes, d))

  function estadoDia(fecha) {
    if (!fechaUltima) return 'normal'
    const dia = diaCicloProyectado(fecha, fechaUltima, config)
    if (esZonaRoja(dia, config)) return 'zonaRoja'
    if (esDiaFertil(dia, config)) return 'fertil'
    return 'normal'
  }

  const COLOR_ESTADO = {
    normal: '',
    fertil:
      modoFertilidad === 'buscando'
        ? 'bg-exito/25 text-exito'
        : 'bg-alerta/25 text-alerta',
    zonaRoja: 'bg-peligro/25 text-peligro',
  }

  function cambiarMes(delta) {
    setRefMes(new Date(anio, mes + delta, 1))
    setDiaSel(null)
  }

  const detalle = diaSel ? construirDetalle(diaSel, fechaUltima, config) : null

  return (
    <div>
      {/* Navegación de mes */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => cambiarMes(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-tarjeta text-texto"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="font-titulo font-bold capitalize text-texto">
          {mesYAnio(refMes)}
        </span>
        <button
          onClick={() => cambiarMes(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-tarjeta text-texto"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      {/* Cabecera de días */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-texto-3">
        {DIAS_CORTO.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      {/* Cuadrícula */}
      <div className="grid grid-cols-7 gap-1">
        {celdas.map((fecha, i) => {
          if (!fecha) return <span key={i} />
          const estado = estadoDia(fecha)
          const key = claveDia(fecha)
          const esHoy = key === hoyKey
          const sel = diaSel && claveDia(diaSel) === key
          return (
            <button
              key={i}
              onClick={() => setDiaSel(fecha)}
              className={`flex aspect-square min-h-touch items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                COLOR_ESTADO[estado] || 'text-texto-2'
              } ${esHoy ? 'ring-2 ring-acento' : ''} ${sel ? 'scale-105 font-bold' : ''}`}
            >
              {fecha.getDate()}
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-texto-3">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-peligro/40" /> Zona Roja
        </span>
        <span className="flex items-center gap-1">
          <span
            className={`h-3 w-3 rounded ${
              modoFertilidad === 'buscando' ? 'bg-exito/40' : 'bg-alerta/40'
            }`}
          />{' '}
          Ventana fértil {modoFertilidad === 'buscando' ? '👶' : '☢️'}
        </span>
      </div>

      {/* Detalle del día tocado */}
      {detalle && (
        <div className="mt-4 animate-aparecer rounded-card border border-borde bg-tarjeta p-4">
          <p className="text-sm capitalize text-texto-3">{fechaLarga(diaSel)}</p>
          <p className="font-titulo text-lg font-bold text-texto">
            {detalle.fase.emoji} Día {detalle.dia} · Fase {detalle.fase.nombre}
          </p>
          <p className="mt-1 text-sm text-texto-2">{detalle.resumen}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {detalle.zonaRoja && (
              <span className="rounded-pill bg-peligro/15 px-2 py-0.5 text-xs font-bold text-peligro">
                🔴 Zona Roja
              </span>
            )}
            {detalle.fertil && (
              <span
                className={`rounded-pill px-2 py-0.5 text-xs font-bold ${
                  modoFertilidad === 'buscando'
                    ? 'bg-exito/15 text-exito'
                    : 'bg-alerta/15 text-alerta'
                }`}
              >
                {modoFertilidad === 'buscando' ? '👶 Fértil' : '☢️ Fértil (precaución)'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function construirDetalle(fecha, fechaUltima, config) {
  if (!fechaUltima) return null
  const dia = diaCicloProyectado(fecha, fechaUltima, config)
  const fase = obtenerFase(dia, config)
  return {
    dia,
    fase,
    resumen: contenidoFase(fase.id).meta.resumen,
    zonaRoja: esZonaRoja(dia, config),
    fertil: esDiaFertil(dia, config),
  }
}
