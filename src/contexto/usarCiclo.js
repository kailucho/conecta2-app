// ============================================================
// usarCiclo — hook que deriva el estado del ciclo para HOY a partir del
// perfil y la config de ciclo. Centraliza los cálculos del motor para que
// las pantallas no repitan lógica.
// ============================================================

import { useMemo } from 'react'
import { usarApp } from './AppContexto.jsx'
import {
  calcularDiaCiclo,
  obtenerFase,
  esZonaRoja,
  esDiaFertil,
  scorePeligrosidad,
  ventanaFertil,
  predecirProximas,
} from '../motor/motorCiclo.js'
import { diasEntre } from '../motor/fechas.js'

/**
 * Devuelve la última fecha de regla registrada (la más reciente).
 */
export function ultimaRegla(ciclo) {
  const regs = ciclo?.registrosRegla || []
  if (regs.length === 0) return null
  return regs
    .map((r) => r.fechaInicio)
    .filter(Boolean)
    .sort()
    .slice(-1)[0]
}

export function usarCiclo() {
  const { ciclo } = usarApp()

  return useMemo(() => {
    const fechaUltima = ultimaRegla(ciclo)
    const hayDatos = !!fechaUltima
    const menopausia = ciclo.etapaVida === 'menopausia'

    if (!hayDatos || menopausia) {
      return {
        hayDatos,
        menopausia,
        fechaUltima,
        dia: null,
        fase: null,
        zonaRoja: false,
        fertil: false,
        score: null,
        ventana: ventanaFertil(ciclo),
        predicciones: [],
      }
    }

    const dia = calcularDiaCiclo(fechaUltima, new Date())
    const fase = obtenerFase(dia, ciclo)
    const predicciones = predecirProximas(fechaUltima, ciclo, 2)

    return {
      hayDatos: true,
      menopausia: false,
      fechaUltima,
      dia,
      fase,
      zonaRoja: esZonaRoja(dia, ciclo),
      fertil: esDiaFertil(dia, ciclo),
      score: scorePeligrosidad(dia, ciclo),
      ventana: ventanaFertil(ciclo),
      predicciones,
      diasParaProximaRegla: predicciones[0]
        ? diasEntre(new Date(), predicciones[0].inicioRegla)
        : null,
    }
  }, [ciclo])
}
