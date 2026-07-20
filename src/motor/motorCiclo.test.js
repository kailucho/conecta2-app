import { describe, it, expect } from 'vitest'
import {
  calcularDiaCiclo,
  diaCicloProyectado,
  obtenerFase,
  esZonaRoja,
  ventanaFertil,
  esDiaFertil,
  recalcularPromedio,
  predecirProximas,
  scorePeligrosidad,
  diaOvulacion,
  limitesFases,
} from './motorCiclo.js'
import { diasEntre, claveDia } from './fechas.js'

const CONFIG_28 = { duracionCiclo: 28, duracionRegla: 5 }
const CONFIG_25 = { duracionCiclo: 25, duracionRegla: 4 }
const CONFIG_35 = { duracionCiclo: 35, duracionRegla: 6 }

describe('calcularDiaCiclo', () => {
  it('el mismo día de la regla es el día 1', () => {
    const hoy = new Date('2026-07-15')
    expect(calcularDiaCiclo(new Date('2026-07-15'), hoy)).toBe(1)
  })

  it('el día siguiente de la regla es el día 2 usando strings ISO locales', () => {
    expect(calcularDiaCiclo('2026-07-19', '2026-07-20')).toBe(2)
  })

  it('cuenta correctamente varios días después', () => {
    expect(calcularDiaCiclo(new Date('2026-07-01'), new Date('2026-07-10'))).toBe(10)
  })

  it('funciona cruzando el cambio de mes', () => {
    // 31 ene → 5 feb = 5 días de diferencia → día 6
    expect(calcularDiaCiclo(new Date('2026-01-31'), new Date('2026-02-05'))).toBe(6)
  })

  it('funciona cruzando el cambio de año', () => {
    expect(calcularDiaCiclo(new Date('2025-12-30'), new Date('2026-01-02'))).toBe(4)
  })

  it('en retraso devuelve un día mayor al largo del ciclo', () => {
    expect(calcularDiaCiclo(new Date('2026-07-01'), new Date('2026-08-01'))).toBe(32)
  })

  it('nunca devuelve menos de 1 si la fecha es futura', () => {
    expect(calcularDiaCiclo(new Date('2026-07-20'), new Date('2026-07-15'))).toBe(1)
  })
})

describe('diaCicloProyectado (envuelve para el calendario)', () => {
  it('envuelve al pasar el largo del ciclo', () => {
    // 30 días después en ciclo de 28 → día 3 del siguiente ciclo
    expect(diaCicloProyectado(new Date('2026-07-31'), new Date('2026-07-01'), CONFIG_28)).toBe(3)
  })

  it('proyecta hacia el pasado correctamente', () => {
    // 1 día antes de la regla → último día del ciclo (28)
    expect(diaCicloProyectado(new Date('2026-06-30'), new Date('2026-07-01'), CONFIG_28)).toBe(28)
  })
})

describe('obtenerFase — ciclo de 28 días', () => {
  it('días 1-5 son menstruales', () => {
    for (const d of [1, 3, 5]) expect(obtenerFase(d, CONFIG_28).id).toBe('menstrual')
  })
  it('días 6-13 son foliculares', () => {
    for (const d of [6, 10, 13]) expect(obtenerFase(d, CONFIG_28).id).toBe('folicular')
  })
  it('días 14-16 son de ovulación', () => {
    for (const d of [14, 15, 16]) expect(obtenerFase(d, CONFIG_28).id).toBe('ovulacion')
  })
  it('días 17-28 son lúteos', () => {
    for (const d of [17, 24, 28]) expect(obtenerFase(d, CONFIG_28).id).toBe('lutea')
  })
  it('marca retraso cuando el día supera el largo del ciclo', () => {
    const f = obtenerFase(31, CONFIG_28)
    expect(f.id).toBe('lutea')
    expect(f.retraso).toBe(true)
  })
})

describe('obtenerFase — ciclos distintos de 28', () => {
  it('ciclo de 25: ovulación cae en día 11', () => {
    expect(diaOvulacion(CONFIG_25)).toBe(11)
    expect(obtenerFase(11, CONFIG_25).id).toBe('ovulacion')
    expect(obtenerFase(4, CONFIG_25).id).toBe('menstrual')
    expect(obtenerFase(25, CONFIG_25).id).toBe('lutea')
  })
  it('ciclo de 35: ovulación cae en día 21', () => {
    expect(diaOvulacion(CONFIG_35)).toBe(21)
    expect(obtenerFase(21, CONFIG_35).id).toBe('ovulacion')
    expect(obtenerFase(6, CONFIG_35).id).toBe('menstrual')
    expect(obtenerFase(7, CONFIG_35).id).toBe('folicular')
  })
  it('las fases no se solapan ni dejan huecos', () => {
    const limites = limitesFases(CONFIG_35)
    expect(limites.menstrual[1] + 1).toBe(limites.folicular[0])
    expect(limites.folicular[1] + 1).toBe(limites.ovulacion[0])
    expect(limites.ovulacion[1] + 1).toBe(limites.lutea[0])
    expect(limites.lutea[1]).toBe(35)
  })
})

describe('esZonaRoja', () => {
  it('los últimos 5 días del ciclo de 28 son zona roja (24-28)', () => {
    for (const d of [24, 25, 26, 27, 28]) expect(esZonaRoja(d, CONFIG_28)).toBe(true)
    expect(esZonaRoja(23, CONFIG_28)).toBe(false)
  })
  it('el retraso también es zona roja', () => {
    expect(esZonaRoja(30, CONFIG_28)).toBe(true)
  })
})

describe('ventanaFertil', () => {
  it('para ciclo de 28: del día 9 al 14', () => {
    expect(ventanaFertil(CONFIG_28)).toEqual({ inicio: 9, fin: 14 })
  })
  it('esDiaFertil marca dentro y fuera correctamente', () => {
    expect(esDiaFertil(9, CONFIG_28)).toBe(true)
    expect(esDiaFertil(14, CONFIG_28)).toBe(true)
    expect(esDiaFertil(8, CONFIG_28)).toBe(false)
    expect(esDiaFertil(15, CONFIG_28)).toBe(false)
  })
})

describe('recalcularPromedio', () => {
  it('con menos de 2 registros devuelve valores por defecto y confiable', () => {
    expect(recalcularPromedio([]).confiable).toBe(true)
    expect(recalcularPromedio([{ fechaInicio: '2026-07-01' }]).cantidadCiclos).toBe(0)
  })

  it('calcula el promedio con ciclos regulares', () => {
    const registros = [
      { fechaInicio: '2026-05-01' },
      { fechaInicio: '2026-05-29' }, // 28
      { fechaInicio: '2026-06-26' }, // 28
    ]
    const r = recalcularPromedio(registros)
    expect(r.promedioReal).toBe(28)
    expect(r.variabilidad).toBe(0)
    expect(r.confiable).toBe(true)
    expect(r.cantidadCiclos).toBe(2)
  })

  it('promedia ciclos ligeramente variables (26, 30 → 28)', () => {
    const registros = [
      { fechaInicio: '2026-05-01' },
      { fechaInicio: '2026-05-27' }, // 26
      { fechaInicio: '2026-06-26' }, // 30
    ]
    const r = recalcularPromedio(registros)
    expect(r.promedioReal).toBe(28)
    expect(r.variabilidad).toBe(4)
    expect(r.confiable).toBe(true)
  })

  it('marca baja confiabilidad cuando la variación supera 7 días', () => {
    const registros = [
      { fechaInicio: '2026-01-01' },
      { fechaInicio: '2026-01-24' }, // 23
      { fechaInicio: '2026-02-28' }, // 35 → variación 12
    ]
    const r = recalcularPromedio(registros)
    expect(r.variabilidad).toBeGreaterThan(7)
    expect(r.confiable).toBe(false)
  })

  it('ignora registros con fechas ausentes', () => {
    const registros = [
      { fechaInicio: '2026-05-01' },
      { fechaInicio: null },
      { fechaInicio: '2026-05-29' },
    ]
    expect(recalcularPromedio(registros).cantidadCiclos).toBe(1)
  })

  it('calcula con strings ISO como fechas locales, incluso al cambiar de mes', () => {
    const resultado = recalcularPromedio([
      { fechaInicio: '2026-01-31' },
      { fechaInicio: '2026-02-28' },
      { fechaInicio: '2026-03-28' },
    ])
    expect(resultado.promedioReal).toBe(28)
    expect(resultado.cantidadCiclos).toBe(2)
  })
})

describe('predecirProximas', () => {
  it('predice 2 reglas con el largo configurado', () => {
    const pred = predecirProximas('2026-07-01', CONFIG_28, 2)
    expect(pred).toHaveLength(2)
    expect(claveDia(pred[0].inicioRegla)).toBe('2026-07-29')
    expect(claveDia(pred[1].inicioRegla)).toBe('2026-08-26')
  })

  it('la ovulación del ciclo predicho cae ~13 días después de su regla', () => {
    const pred = predecirProximas('2026-07-01', CONFIG_28, 1)
    // La ovulación pertenece al ciclo que empieza en inicioRegla → va después.
    expect(pred[0].ovulacion > pred[0].inicioRegla).toBe(true)
    expect(diasEntre(pred[0].inicioRegla, pred[0].ovulacion)).toBe(13)
  })

  it('usa el promedio real cuando está disponible', () => {
    const cfg = { ...CONFIG_28, promedioReal: 30 }
    const pred = predecirProximas('2026-07-01', cfg, 1)
    expect(diasEntre('2026-07-01', pred[0].inicioRegla)).toBe(30)
  })

  it('sin última regla devuelve lista vacía', () => {
    expect(predecirProximas(null, CONFIG_28)).toEqual([])
  })
})

describe('scorePeligrosidad', () => {
  it('es máximo en zona roja', () => {
    expect(scorePeligrosidad(27, CONFIG_28)).toBe(9)
  })
  it('es bajo en fase folicular', () => {
    expect(scorePeligrosidad(8, CONFIG_28)).toBe(2)
  })
  it('siempre está entre 0 y 10', () => {
    for (let d = 1; d <= 40; d++) {
      const s = scorePeligrosidad(d, CONFIG_28)
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(10)
    }
  })
})
