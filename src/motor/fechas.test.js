import { describe, expect, it } from 'vitest'
import {
  aMedianoche,
  claveDia,
  crearFechaISO,
  descomponerFechaISO,
  esFechaISOValida,
  formatearFechaCorta,
} from './fechas.js'

describe('fechas de calendario ISO', () => {
  it('crea y descompone una fecha sin cambiar el orden interno', () => {
    expect(crearFechaISO(2026, 7, 19)).toBe('2026-07-19')
    expect(descomponerFechaISO('2026-07-19')).toEqual({
      anio: '2026',
      mes: '07',
      dia: '19',
    })
    expect(formatearFechaCorta('2026-07-19')).toBe('19/07/2026')
  })

  it('rechaza fechas que Date normalizaría silenciosamente', () => {
    expect(esFechaISOValida('2026-02-31')).toBe(false)
    expect(crearFechaISO(2026, 2, 31)).toBe('')
  })

  it('rechaza 29 de febrero de 2025 y acepta el bisiesto de 2024', () => {
    expect(esFechaISOValida('2025-02-29')).toBe(false)
    expect(esFechaISOValida('2024-02-29')).toBe(true)
  })

  it('aMedianoche conserva exactamente año, mes y día locales', () => {
    const fecha = aMedianoche('2026-07-19')
    expect(fecha.getFullYear()).toBe(2026)
    expect(fecha.getMonth()).toBe(6)
    expect(fecha.getDate()).toBe(19)
    expect(claveDia(fecha)).toBe('2026-07-19')
  })
})
