// Timer de enfriamiento de 20 min (autocalmado de Gottman). Al activarlo,
// "envía" a la pareja el mensaje de pausa sin abandono. Al terminar, sugiere
// retomar con inicio suave. Convierte El Muro (bloqueo) en pausa saludable.
import { useEffect, useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { notificar } from '../../servicios/notificaciones.js'
import { MENSAJE_PAUSA, INICIO_SUAVE_SUGERENCIA } from '../../datos/protocolosSOS.js'

const DURACION = 20 * 60 // segundos

export default function TimerEnfriamiento() {
  const { perfil, config, crearInteraccion } = usarApp()
  const [activo, setActivo] = useState(false)
  const [restante, setRestante] = useState(DURACION)
  const [terminado, setTerminado] = useState(false)

  useEffect(() => {
    if (!activo) return
    if (restante <= 0) {
      setActivo(false)
      setTerminado(true)
      notificar('Pasaron los 20 min 💙', {
        body: 'Pueden retomar la conversación con calma.',
      })
      return
    }
    const t = setTimeout(() => setRestante((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [activo, restante])

  async function activar() {
    setActivo(true)
    setRestante(DURACION)
    setTerminado(false)
    // Envía la pausa sin abandono a la pareja.
    await crearInteraccion({
      coupleId: perfil.coupleId,
      senderId: perfil.userId,
      receiverId: perfil.partnerId,
      type: 'quick_action',
      actionId: 'pausa_consciente',
      category: 'feeling',
      note: MENSAJE_PAUSA,
      valencia: 0,
    })
    notificar('Pausa consciente 💙', {
      body: MENSAJE_PAUSA,
      ocultarSensible: !config.notifSensibles,
    })
  }

  const min = String(Math.floor(restante / 60)).padStart(2, '0')
  const seg = String(restante % 60).padStart(2, '0')

  if (terminado) {
    return (
      <div className="rounded-xl bg-exito/10 p-4">
        <p className="font-titulo font-bold text-exito">✓ Pausa completada</p>
        <p className="mt-1 text-sm text-texto-2">{INICIO_SUAVE_SUGERENCIA}</p>
      </div>
    )
  }

  if (activo) {
    return (
      <div className="rounded-xl bg-tarjeta-hover p-4 text-center">
        <p className="text-sm text-texto-2">Respira. Ya van a hablar.</p>
        <p className="my-2 font-titulo text-4xl font-extrabold text-acento">
          {min}:{seg}
        </p>
        <p className="text-xs text-texto-3">{MENSAJE_PAUSA}</p>
        <button
          onClick={() => {
            setActivo(false)
            setRestante(DURACION)
          }}
          className="mt-2 text-xs text-texto-3 underline"
        >
          Terminar antes
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={activar}
      className="w-full rounded-pill bg-acento/20 py-3 font-titulo text-sm font-bold text-acento active:scale-[0.98]"
    >
      ⏸️ Activar pausa de 20 min (sin abandono)
    </button>
  )
}
