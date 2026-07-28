// ============================================================
// PronosticoSemanal — fila horizontal desplazable con el pronóstico de los
// próximos 7 días. Cada día abre un detalle accesible (bottom sheet) con
// energía, sensibilidad, molestias, recomendación y acción de WhatsApp.
// ============================================================

import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import ModalHoja from '../comunes/ModalHoja.jsx'
import EncabezadoSeccion from './EncabezadoSeccion.jsx'
import { pronosticoSemana } from '../../motor/pronosticoPareja.js'
import { fechaLarga, aMedianoche } from '../../motor/fechas.js'
import { abrirWhatsApp } from '../../servicios/whatsappService.js'

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export default function PronosticoSemanal({ ctx, whatsappPareja }) {
  const [seleccion, setSeleccion] = useState(null)
  const semana = pronosticoSemana(new Date(), ctx)

  async function prepararWhatsApp(dia) {
    const texto = `${dia.mensajeNotificacion} ${dia.recomendacionPareja}`
    await abrirWhatsApp({ telefono: whatsappPareja, texto })
  }

  return (
    <TarjetaBase>
      <EncabezadoSeccion icono="📅">Pronóstico de la semana</EncabezadoSeccion>
      <div
        role="list"
        aria-label="Pronóstico de los próximos 7 días"
        className="scroll-fade-x -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {semana.map((dia, i) => {
          // dia.fecha es "AAAA-MM-DD": parsear con aMedianoche (fecha LOCAL),
          // nunca con `new Date(str)` directo (eso lo interpreta como UTC y
          // desfasa el día de la semana en husos horarios negativos, p.ej.
          // Perú UTC-5, mostrando "hoy" como si fuera el día anterior).
          const fecha = aMedianoche(dia.fecha)
          const esHoy = i === 0
          const diaCorto = esHoy ? 'Hoy' : DIAS_CORTOS[fecha.getDay()].replace(/^./, (c) => c.toUpperCase())
          return (
            <button
              key={dia.fecha}
              role="listitem"
              onClick={() => setSeleccion(dia)}
              aria-label={`${diaCorto}: ${dia.nivel} de 10, ${dia.nivelTextual}`}
              className={`flex min-h-touch min-w-[64px] shrink-0 flex-col items-center gap-0.5 rounded-2xl border bg-tarjeta px-2 py-2 text-center transition-transform active:scale-95 ${
                esHoy ? 'border-2 border-acento' : 'border-borde'
              }`}
            >
              <span className={`text-[11px] font-semibold ${esHoy ? 'text-acento' : 'text-texto-3'}`}>
                {diaCorto}
              </span>
              <span className="text-xl" aria-hidden="true">{dia.clima}</span>
              <span className="text-sm font-bold text-texto">{dia.nivel}/10</span>
            </button>
          )
        })}
      </div>

      <ModalHoja
        abierto={!!seleccion}
        alCerrar={() => setSeleccion(null)}
        titulo={seleccion ? fechaLarga(seleccion.fecha) : ''}
      >
        {seleccion && (
          <div className="space-y-3">
            <p className="text-lg font-bold text-texto">
              {seleccion.clima} {seleccion.nivel}/10 · {seleccion.nivelTextual}
            </p>
            <p className="text-xs text-texto-3">Confianza: {seleccion.confianza}</p>
            {seleccion.mostrarFase && seleccion.fase && (
              <p className="text-sm text-texto-2">Fase: {seleccion.fase.nombre}</p>
            )}
            <p className="text-sm text-texto-2">Energía: {seleccion.energia}</p>
            <p className="text-sm text-texto-2">Sensibilidad: {seleccion.sensibilidad}</p>
            {seleccion.molestias.length > 0 && (
              <p className="text-sm text-texto-2">
                Posibles molestias: {seleccion.molestias.join(', ')}
              </p>
            )}
            <p className="text-sm font-semibold text-texto">{seleccion.recomendacionPareja}</p>
            <button
              onClick={() => prepararWhatsApp(seleccion)}
              className="w-full rounded-pill bg-acento py-3 font-titulo font-bold text-white"
            >
              Preparar mensaje para WhatsApp 💬
            </button>
          </div>
        )}
      </ModalHoja>
    </TarjetaBase>
  )
}
