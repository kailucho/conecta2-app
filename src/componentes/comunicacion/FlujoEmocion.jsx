// ============================================================
// FlujoEmocion — "Cómo me siento". Unifica el envío de ánimo (positivo) y las
// alertas de estado (neutro/bajo). Tras elegir, ofrece una pregunta opcional
// "¿y qué necesitas?" que se guarda como nota legible + campo aditivo.
// ============================================================

import { useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarPuntos } from '../../contexto/usarPuntos.js'
import { claveDia, finDelDia } from '../../motor/fechas.js'
import { alertaPorId } from '../../datos/alertasEstado.js'
import { notificar, vibrar } from '../../servicios/notificaciones.js'

// tipo 'animo' → gesto positivo (valencia 1); tipo 'alerta' → estado (valencia 0).
const EMOCIONES = [
  { id: 'bien', label: 'Bien', emoji: '😄', tipo: 'animo', actionId: '😄', expresion: 'feliz' },
  { id: 'carinoso', label: 'Cariñoso/a', emoji: '🥰', tipo: 'animo', actionId: '🥰', expresion: 'amor' },
  { id: 'cansado', label: 'Cansado/a', emoji: '🔋', tipo: 'alerta', actionId: 'sin_bateria', expresion: 'cansado' },
  { id: 'triste', label: 'Triste o bajoneado/a', emoji: '💙', tipo: 'alerta', actionId: 'sensible', expresion: 'sensible' },
  { id: 'saturado', label: 'Saturado/a o molesto/a', emoji: '🌪️', tipo: 'alerta', actionId: 'estresado', expresion: 'pensativo' },
]

const MAS_ESTADOS = [
  { id: 'irritable', label: 'Irritable', emoji: '🔴', tipo: 'alerta', actionId: 'irritable', expresion: 'sensible' },
  { id: 'cueva', label: 'Modo cueva', emoji: '🕳️', tipo: 'alerta', actionId: 'cueva', expresion: 'cueva' },
]

const NECESIDADES = [
  { id: 'cariño', label: 'Quiero cariño' },
  { id: 'escucha', label: 'Quiero que me escuches' },
  { id: 'momento', label: 'Necesito un momento' },
  { id: 'ayuda', label: 'Necesito ayuda' },
  { id: 'contar', label: 'No necesito nada, solo quería contártelo' },
]

export default function FlujoEmocion({ alConfirmar, alVolver, onReaccion }) {
  const { perfil, config, crearInteraccion } = usarApp()
  const { otorgar } = usarPuntos()
  const [elegida, setElegida] = useState(null)
  const [verMas, setVerMas] = useState(false)

  async function enviar(emocion, necesidad) {
    const hoy = claveDia(new Date())
    const notaTexto = necesidad ? necesidad.label : null
    const base = {
      coupleId: perfil.coupleId,
      senderId: perfil.userId,
      receiverId: perfil.partnerId,
      note: notaTexto,
      necesidad: necesidad?.id || null,
    }

    let mensajeConfirma
    if (emocion.tipo === 'animo') {
      await crearInteraccion({
        ...base,
        type: 'animo',
        actionId: emocion.actionId,
        category: 'gesture',
        valencia: 1,
      })
      await otorgar(5, `animo:${hoy}`)
      mensajeConfirma = 'Tu pareja verá cómo te sientes 💗'
    } else {
      const def = alertaPorId(emocion.actionId)
      await crearInteraccion({
        ...base,
        type: 'alerta_estado',
        actionId: emocion.actionId,
        category: 'feeling',
        valencia: 0,
        expiresAt: finDelDia(),
      })
      await otorgar(5, `estado:${hoy}`)
      mensajeConfirma = def?.mensaje || 'Tu pareja sabrá cómo tratarte hoy 💛'
    }

    notificar('Tu pareja compartió cómo se siente', {
      ocultarSensible: !config.notifSensibles,
    })
    vibrar([30], config.vibracion)
    onReaccion?.(emocion.expresion)
    alConfirmar({ icono: emocion.emoji, titulo: 'Se lo hiciste saber', mensaje: mensajeConfirma })
  }

  // Paso 2: pregunta opcional de necesidad.
  if (elegida) {
    return (
      <div className="space-y-3">
        <p className="text-center text-sm text-texto-2">
          {elegida.emoji} {elegida.label} · ¿y qué necesitas?
        </p>
        <div className="space-y-2">
          {NECESIDADES.map((n) => (
            <button
              key={n.id}
              onClick={() => enviar(elegida, n)}
              className="w-full rounded-xl border border-borde bg-tarjeta px-4 py-3 text-left text-sm text-texto transition-transform active:scale-[0.98]"
            >
              {n.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => enviar(elegida, null)}
          className="w-full rounded-pill bg-acento py-2.5 font-titulo text-sm font-bold text-white active:scale-[0.98]"
        >
          Enviar solo mi estado 💌
        </button>
        <button
          onClick={() => setElegida(null)}
          className="w-full text-center text-xs font-semibold text-texto-3"
        >
          ← Elegir otro
        </button>
      </div>
    )
  }

  // Paso 1: elegir emoción.
  const opciones = verMas ? [...EMOCIONES, ...MAS_ESTADOS] : EMOCIONES
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-texto-2">¿Cómo te sientes ahora?</p>
      <div className="space-y-2">
        {opciones.map((e) => (
          <button
            key={e.id}
            onClick={() => setElegida(e)}
            className="flex w-full items-center gap-3 rounded-xl border border-borde bg-tarjeta px-4 py-3 text-left transition-transform active:scale-[0.98]"
          >
            <span className="text-2xl">{e.emoji}</span>
            <span className="text-sm text-texto">{e.label}</span>
          </button>
        ))}
      </div>
      {!verMas && (
        <button
          onClick={() => setVerMas(true)}
          className="w-full text-center text-sm font-semibold text-acento"
        >
          Ver más estados
        </button>
      )}
      <button
        onClick={alVolver}
        className="w-full text-center text-xs font-semibold text-texto-3"
      >
        ← Volver
      </button>
    </div>
  )
}
