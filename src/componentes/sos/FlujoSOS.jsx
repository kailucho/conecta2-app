// ============================================================
// FlujoSOS 🚨 — ayuda paso a paso ante un conflicto.
//   1) Elegir escenario (Discusión / Molesta / Metí la pata / No sé qué hice).
//   2) Protocolo paso a paso + herramientas: pausa de 20 min y reformulador.
// Registra el uso; si hay 4+ usos en 14 días, muestra banner de terapia amable.
// (El chat conversacional con IA se activa en la Etapa 12.)
// ============================================================

import { useState, useMemo } from 'react'
import ModalHoja from '../comunes/ModalHoja.jsx'
import Acordeon from '../comunes/Acordeon.jsx'
import TimerEnfriamiento from './TimerEnfriamiento.jsx'
import Reformulador from './Reformulador.jsx'
import ChatSOS from './ChatSOS.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import {
  ESCENARIOS_SOS,
  escenarioPorId,
  BANNER_TERAPIA,
} from '../../datos/protocolosSOS.js'
import { parejaVinculada } from '../../servicios/syncService.js'

export default function FlujoSOS({ alCerrar }) {
  const { perfil, config, sos, registrarSOS, enviarInteraccionPareja } = usarApp()
  const [escenarioId, setEscenarioId] = useState(null)

  // ¿4+ usos de SOS en los últimos 14 días?
  const mostrarBannerTerapia = useMemo(() => {
    const limite = Date.now() - 14 * 86400000
    const recientes = (sos.usos || []).filter(
      (u) => new Date(u.fecha).getTime() >= limite,
    )
    return recientes.length >= 4
  }, [sos.usos])

  async function elegir(id) {
    setEscenarioId(id)
    await registrarSOS(id)
    // El uso local ya quedó registrado; el aviso remoto es opcional y guardado.
    if (parejaVinculada(perfil)) {
      await enviarInteraccionPareja({
        type: 'sos',
        actionId: id,
        category: 'sos',
        valencia: -1,
      }, { tipo: 'sos', actionId: id })
    }
  }

  const escenario = escenarioId ? escenarioPorId(escenarioId) : null

  return (
    <ModalHoja abierto alCerrar={alCerrar} titulo="SOS 🚨 ¿Qué pasó?">
      {mostrarBannerTerapia && (
        <div className="mb-4 rounded-xl bg-acento/10 p-3">
          <p className="font-titulo font-bold text-texto">{BANNER_TERAPIA.titulo}</p>
          <p className="mt-1 text-sm text-texto-2">{BANNER_TERAPIA.texto}</p>
          <p className="mt-1 text-xs text-texto-3">{BANNER_TERAPIA.nota}</p>
        </div>
      )}

      {!escenario ? (
        <div className="space-y-2">
          <p className="text-sm text-texto-2">
            Respira. Elige qué está pasando y te ayudo paso a paso.
          </p>
          {ESCENARIOS_SOS.map((e) => (
            <button
              key={e.id}
              onClick={() => elegir(e.id)}
              className="flex w-full items-center gap-3 rounded-card border border-borde bg-tarjeta p-3 text-left transition-all active:scale-[0.99]"
            >
              <span className="text-2xl">{e.emoji}</span>
              <span className="font-titulo font-bold text-texto">{e.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setEscenarioId(null)}
            className="text-sm text-acento"
          >
            ← Elegir otra cosa
          </button>

          <div>
            <p className="font-titulo text-lg font-bold text-texto">
              {escenario.emoji} {escenario.label}
            </p>
            <ol className="mt-2 space-y-2">
              {escenario.pasos.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-texto-2">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-acento/20 text-xs font-bold text-acento">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Herramienta: pausa sin abandono */}
          <TimerEnfriamiento />

          {/* Herramienta: reformulador de quejas */}
          <Acordeon titulo="Reformular una queja" subtitulo="Convertir el reclamo en pedido" emoji="🌱">
            <Reformulador />
          </Acordeon>

          {/* Chat con IA (o guía estática si la IA está apagada) */}
          <Acordeon
            titulo="Hablarlo con la app"
            subtitulo={config.iaActiva ? 'Cuéntame y te ayudo' : 'Guía rápida'}
            emoji="💬"
          >
            <ChatSOS escenario={escenario} />
          </Acordeon>
        </div>
      )}
    </ModalHoja>
  )
}
