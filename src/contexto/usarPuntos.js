// ============================================================
// usarPuntos — hook para otorgar puntos de forma consistente. Respeta el
// toggle de gamificación y el anti-spam. Devuelve info por si la UI quiere
// celebrar una subida de nivel (nunca castiga).
// ============================================================

import { useCallback } from 'react'
import { usarApp } from './AppContexto.jsx'
import { sumarPuntos } from '../motor/gamificacion.js'

export function usarPuntos() {
  const { gamificacion, config, actualizarGamificacion } = usarApp()

  const otorgar = useCallback(
    async (puntos, claveAntiSpam = null) => {
      if (!config.gamificacionActiva) return { sumo: false }
      const res = sumarPuntos(gamificacion, puntos, claveAntiSpam)
      if (res.sumo) await actualizarGamificacion(res.estado)
      return res
    },
    [gamificacion, config.gamificacionActiva, actualizarGamificacion],
  )

  return { otorgar, gamificacionActiva: config.gamificacionActiva }
}
