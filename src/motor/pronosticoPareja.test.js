import { describe, expect, it } from 'vitest'
import { pronosticoDelDia, pronosticoSemana } from './pronosticoPareja.js'

const USER = 'user-1'
const PARTNER = 'partner-1'
const HOY = new Date('2026-07-20T12:00:00.000Z')

function ctxBase(overrides = {}) {
  return {
    ciclo: { duracionCiclo: 28, duracionRegla: 5, confiable: true },
    fechaUltimaRegla: '2026-07-01',
    interacciones: [],
    userId: USER,
    partnerId: PARTNER,
    privacidadHormonal: 'todo',
    hoy: HOY,
    ...overrides,
  }
}

describe('pronosticoDelDia', () => {
  it('devuelve 7 días consecutivos con pronosticoSemana', () => {
    const semana = pronosticoSemana(HOY, ctxBase())
    expect(semana).toHaveLength(7)
    semana.forEach((dia) => expect(dia.fecha).toBeTruthy())
  })

  it('refleja el cambio de fase a lo largo de la semana', () => {
    const semana = pronosticoSemana(new Date('2026-07-01T12:00:00.000Z'), ctxBase({ hoy: new Date('2026-07-01T12:00:00.000Z') }))
    expect(semana[0].fase.id).toBe('menstrual')
  })

  it('calcula correctamente un ciclo de 28 días', () => {
    const r = pronosticoDelDia(HOY, ctxBase())
    expect(r.diaCiclo).toBe(20)
    expect(r.fase.id).toBe('lutea')
  })

  it('calcula correctamente un ciclo distinto de 28 días', () => {
    const r = pronosticoDelDia(HOY, ctxBase({ ciclo: { duracionCiclo: 35, duracionRegla: 6, confiable: true } }))
    expect(r.fase).toBeTruthy()
  })

  it('reduce la confianza con ciclo irregular (no confiable)', () => {
    const futura = new Date('2026-07-27T12:00:00.000Z')
    const r = pronosticoDelDia(futura, ctxBase({ ciclo: { duracionCiclo: 28, duracionRegla: 5, confiable: false } }))
    expect(r.confianza).toBe('baja')
  })

  it('sin datos de ciclo devuelve confianza sin_datos', () => {
    const r = pronosticoDelDia(HOY, ctxBase({ fechaUltimaRegla: null }))
    expect(r.confianza).toBe('sin_datos')
    expect(r.mostrarFase).toBe(false)
  })

  it('menopausia no muestra pronóstico menstrual', () => {
    const r = pronosticoDelDia(HOY, ctxBase({ ciclo: { etapaVida: 'menopausia' }, fechaUltimaRegla: '2026-07-01' }))
    expect(r.fase).toBeNull()
  })

  it('fecha futura usa lenguaje/estructura probabilística, no inventa estado', () => {
    const futura = new Date('2026-07-25T12:00:00.000Z')
    const r = pronosticoDelDia(futura, ctxBase())
    expect(r.hayEstadoReal).toBe(false)
    expect(r.señales).not.toContain('estado_real')
  })

  it('el estado real declarado tiene prioridad sobre el pronóstico calculado', () => {
    const interacciones = [
      {
        type: 'alerta_estado',
        actionId: 'irritable',
        senderId: USER,
        receiverId: PARTNER,
        status: 'pendiente_sync',
        createdAt: HOY.toISOString(),
      },
    ]
    const r = pronosticoDelDia(HOY, ctxBase({ interacciones }))
    expect(r.hayEstadoReal).toBe(true)
    expect(r.confianza).toBe('alta')
    expect(r.señales).toContain('estado_real')
  })

  it('respeta privacidad solo_alertas: no filtra información hormonal (no muestra fase)', () => {
    const r = pronosticoDelDia(HOY, ctxBase({ privacidadHormonal: 'solo_alertas' }))
    expect(r.mostrarFase).toBe(false)
    expect(r.fase).toBeNull()
  })
})
