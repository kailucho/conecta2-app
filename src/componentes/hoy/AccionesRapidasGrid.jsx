// ============================================================
// AccionesRapidasGrid — atajos a las acciones más usadas del día. Reutiliza
// el registro de datos/accionesRapidas.js (ACCIONES_DESTACADAS_HOY — el
// MISMO catálogo que el popover de BarraComunicacion, para no ofrecer dos
// listas distintas de "lo mismo" en la misma pantalla) y
// usarEnvioInteraccion(), que ya resuelve el canal: con pareja vinculada
// envía interno; sin vínculo prepara un mensaje de WhatsApp — nunca bloquea
// con el modal de vinculación.
//
// Fila horizontal compacta (no tarjeta 2×2 de página completa): es una
// acción secundaria frente al pronóstico del día, no compite en tamaño con él.
// ============================================================

import { useState } from 'react'
import { accionPorId, ACCIONES_DESTACADAS_HOY } from '../../datos/accionesRapidas.js'
import { usarEnvioInteraccion } from '../comunicacion/usarEnvioInteraccion.js'
import { claveDia } from '../../motor/fechas.js'
import EncabezadoSeccion from './EncabezadoSeccion.jsx'

// Mismo patrón que los chips de Energía/Sensibilidad/Antojos (Velocimetro /
// ClimaInterno): opacidad sobre token de tema, para que la insignia se
// adapte sola al modo oscuro (Esposo) o claro (Esposa) en vez de un pastel
// fijo pensado solo para fondo claro.
const COLOR_POR_ID = {
  hambre: 'bg-exito/15 text-exito',
  engreir: 'bg-peligro/15 text-peligro',
  extrano: 'bg-acento/15 text-acento',
  meti_pata: 'bg-alerta/15 text-alerta',
}

export default function AccionesRapidasGrid({ onReaccion, onVerMas }) {
  const enviarAccion = usarEnvioInteraccion()
  const [enviandoId, setEnviandoId] = useState(null)
  const [confirmadoId, setConfirmadoId] = useState(null)

  async function tocar(id) {
    if (enviandoId) return
    const accion = accionPorId(id)
    if (!accion) return
    setEnviandoId(id)
    const resultado = await enviarAccion(accion, { claveAntiSpam: `rapida:${id}:${claveDia(new Date())}` })
    setEnviandoId(null)
    if (!resultado?.ok) return
    onReaccion?.(accion.expresion)
    setConfirmadoId(id)
    setTimeout(() => setConfirmadoId(null), 1500)
  }

  return (
    <div>
      <EncabezadoSeccion icono="⚡" accion={onVerMas ? 'Ver más' : undefined} alTocarAccion={onVerMas}>
        Acciones rápidas
      </EncabezadoSeccion>
      <div className="scroll-fade-x -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {ACCIONES_DESTACADAS_HOY.map((id) => {
          const accion = accionPorId(id)
          if (!accion) return null
          const confirmado = confirmadoId === id
          return (
            <button
              key={id}
              onClick={() => tocar(id)}
              disabled={enviandoId === id}
              aria-label={accion.label}
              className="flex min-h-touch min-w-[92px] shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-borde bg-tarjeta px-2 py-3 text-center transition-transform active:scale-95 disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${COLOR_POR_ID[id]}`}
              >
                {confirmado ? '✅' : accion.emoji}
              </span>
              <span className="text-[11px] font-semibold leading-tight text-texto">{accion.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
