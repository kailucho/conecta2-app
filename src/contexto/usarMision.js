// ============================================================
// usarMision — hook con la misión del día y su completado seguro. Centraliza el
// patrón de "un solo write" para no pisar los puntos al marcar misionesHechas,
// y garantiza la misma clave anti-spam desde cualquier vista.
// ============================================================

import { useCallback } from 'react'
import { usarApp } from './AppContexto.jsx'
import { sumarPuntos } from '../motor/gamificacion.js'
import { convivenJuntos } from '../datos/lenguaje.js'
import { misionDelDia, claveMisionHecha } from '../datos/misiones.js'
import { diaDelAnio } from '../motor/fechas.js'

export function usarMision(semilla = diaDelAnio()) {
  const { perfil, config, gamificacion, actualizarGamificacion } = usarApp()
  const conviven = convivenJuntos(perfil.tipoRelacion)
  const mision = misionDelDia(conviven, semilla)
  const clave = claveMisionHecha(mision, semilla)
  const hecha = (gamificacion.misionesHechas || []).includes(clave)

  const completar = useCallback(async () => {
    if (hecha) return
    const nueva = { ...gamificacion }
    if (config.gamificacionActiva) {
      const res = sumarPuntos(nueva, mision.puntos, clave)
      Object.assign(nueva, res.estado)
    }
    nueva.misionesHechas = [...(gamificacion.misionesHechas || []), clave]
    await actualizarGamificacion(nueva)
  }, [hecha, gamificacion, config.gamificacionActiva, mision.puntos, clave, actualizarGamificacion])

  return { mision, hecha, completar }
}
