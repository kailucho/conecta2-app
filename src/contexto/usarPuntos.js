// ============================================================
// usarPuntos — hook para otorgar puntos de forma consistente. Respeta el
// toggle de gamificación y el anti-spam. Devuelve info por si la UI quiere
// celebrar una subida de nivel (nunca castiga).
// ============================================================

import { useCallback } from 'react'
import { usarApp } from './AppContexto.jsx'
import { sumarPuntos } from '../motor/gamificacion.js'
import { parejaVinculada } from '../servicios/syncService.js'
import { supabaseConfigurado } from '../servicios/supabaseClient.js'
import { registrarEvento } from '../servicios/gamificationRepository.js'

// Solo estos prefijos de clave tienen un evento remoto permitido (deben
// coincidir con la lista fija del lado servidor en award_points, ver
// supabase/migrations/0008_point_events.sql). Cualquier otra clave se queda
// 100% local, sin intentar la red.
const PREFIJOS_EVENTO_REMOTO = new Set(['aprecio', 'animo', 'estado', 'accion', 'mensaje', 'deseo', 'cita'])

export function usarPuntos() {
  const { perfil, gamificacion, config, actualizarGamificacion } = usarApp()

  const otorgar = useCallback(
    async (puntos, claveAntiSpam = null) => {
      if (!config.gamificacionActiva) return { sumo: false }
      const res = sumarPuntos(gamificacion, puntos, claveAntiSpam)
      if (res.sumo) await actualizarGamificacion(res.estado)

      // Registra el evento en el servidor para que ambos dispositivos
      // converjan al mismo total. No bloquea la UI ni afecta el resultado
      // local: si falla, el próximo otorgar/reconciliación lo intenta de nuevo.
      if (
        res.sumo &&
        supabaseConfigurado &&
        parejaVinculada(perfil) &&
        claveAntiSpam &&
        PREFIJOS_EVENTO_REMOTO.has(claveAntiSpam.split(':')[0])
      ) {
        registrarEvento(claveAntiSpam)
      }

      return res
    },
    [perfil, gamificacion, config.gamificacionActiva, actualizarGamificacion],
  )

  return { otorgar, gamificacionActiva: config.gamificacionActiva }
}
