// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { debeMostrarResumenHoy, contenidoResumenMatutino, mostrarResumenMatutinoSiCorresponde } from './notificaciones.js'

function resumenBase(overrides = {}) {
  return {
    activo: true,
    hora: '07:00',
    dias: [0, 1, 2, 3, 4, 5, 6],
    zonaHoraria: 'America/Lima',
    finesSemana: true,
    contenidoSensible: false,
    silencio: false,
    ultimaFecha: null,
    ...overrides,
  }
}

// 12:00 en America/Lima (UTC-5) un martes.
const AHORA = new Date('2026-07-21T17:00:00.000Z')

describe('debeMostrarResumenHoy', () => {
  it('preferencia desactivada no muestra nada', () => {
    expect(debeMostrarResumenHoy(resumenBase({ activo: false }), AHORA)).toBe(false)
  })

  it('día habilitado sí muestra', () => {
    expect(debeMostrarResumenHoy(resumenBase(), AHORA)).toBe(true)
  })

  it('día deshabilitado no muestra', () => {
    expect(debeMostrarResumenHoy(resumenBase({ dias: [] }), AHORA)).toBe(false)
  })

  it('respeta la hora configurada (aún no llega)', () => {
    expect(debeMostrarResumenHoy(resumenBase({ hora: '23:59' }), AHORA)).toBe(false)
  })

  it('respeta zona horaria', () => {
    // A las 17:00 UTC son las 12:00 en Lima (UTC-5); con hora=07:00 ya pasó.
    expect(debeMostrarResumenHoy(resumenBase({ hora: '07:00', zonaHoraria: 'America/Lima' }), AHORA)).toBe(true)
  })

  it('no se duplica el mismo día (idempotencia diaria)', () => {
    const hoyISO = '2026-07-21'
    expect(debeMostrarResumenHoy(resumenBase({ ultimaFecha: hoyISO }), AHORA)).toBe(false)
  })

  it('fines de semana desactivados no muestran sábado/domingo', () => {
    const sabado = new Date('2026-07-25T17:00:00.000Z')
    expect(debeMostrarResumenHoy(resumenBase({ finesSemana: false }), sabado)).toBe(false)
  })
})

describe('contenidoResumenMatutino', () => {
  it('contenido discreto no revela detalles', () => {
    const r = contenidoResumenMatutino({ nivel: 8, hayEstadoReal: false }, resumenBase({ contenidoSensible: false }))
    expect(r.titulo).toBe('Conecta2 tiene listo tu resumen de hoy.')
    expect(r.cuerpo).toBe('')
  })

  it('contenido sensible permitido muestra nivel', () => {
    const r = contenidoResumenMatutino({ nivel: 8, hayEstadoReal: false, recomendacionPareja: 'x' }, resumenBase({ contenidoSensible: true }))
    expect(r.titulo).toContain('8/10')
  })

  it('estado real declarado tiene prioridad en el mensaje', () => {
    const r = contenidoResumenMatutino(
      { nivel: 3, hayEstadoReal: true, recomendacionPareja: 'Un mensajito bonito podría ayudar.' },
      resumenBase({ contenidoSensible: true }),
    )
    expect(r.cuerpo).toContain('mensajito')
  })
})

describe('mostrarResumenMatutinoSiCorresponde', () => {
  it('marca la fecha como notificada tras mostrar (evita duplicados)', () => {
    const actualizar = vi.fn()
    const mostrado = mostrarResumenMatutinoSiCorresponde(
      { nivel: 3, hayEstadoReal: false },
      resumenBase(),
      actualizar,
      AHORA,
    )
    expect(mostrado).toBe(true)
    expect(actualizar).toHaveBeenCalledWith(expect.objectContaining({ ultimaFecha: '2026-07-21' }))
  })

  it('no hace nada si ya se mostró hoy', () => {
    const actualizar = vi.fn()
    const mostrado = mostrarResumenMatutinoSiCorresponde(
      { nivel: 3, hayEstadoReal: false },
      resumenBase({ ultimaFecha: '2026-07-21' }),
      actualizar,
      AHORA,
    )
    expect(mostrado).toBe(false)
    expect(actualizar).not.toHaveBeenCalled()
  })
})
