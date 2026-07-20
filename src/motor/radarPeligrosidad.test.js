import { describe, expect, it } from 'vitest'
import { calcularRadarPeligrosidad, nivelPorScore, NIVELES_RADAR } from './radarPeligrosidad.js'

const USER = 'user-1'
const PARTNER = 'partner-1'
const HOY = new Date('2026-07-20T12:00:00.000Z')

function alerta(actionId, overrides = {}) {
  return {
    type: 'alerta_estado',
    actionId,
    senderId: PARTNER,
    receiverId: USER,
    status: 'pendiente_sync',
    createdAt: HOY.toISOString(),
    expiresAt: new Date('2026-07-20T23:59:59.999Z').toISOString(),
    ...overrides,
  }
}

function animo(actionId, overrides = {}) {
  return {
    type: 'animo',
    actionId,
    senderId: PARTNER,
    receiverId: USER,
    status: 'pendiente_sync',
    createdAt: HOY.toISOString(),
    ...overrides,
  }
}

describe('nivelPorScore', () => {
  it('mapea cada rango 0-10 al nivel correcto', () => {
    expect(nivelPorScore(0).id).toBe('tranquilo')
    expect(nivelPorScore(2).id).toBe('tranquilo')
    expect(nivelPorScore(3).id).toBe('antenas')
    expect(nivelPorScore(4).id).toBe('antenas')
    expect(nivelPorScore(5).id).toBe('mimos')
    expect(nivelPorScore(6).id).toBe('mimos')
    expect(nivelPorScore(7).id).toBe('delicada')
    expect(nivelPorScore(8).id).toBe('delicada')
    expect(nivelPorScore(9).id).toBe('legendario')
    expect(nivelPorScore(10).id).toBe('legendario')
  })

  it('cubre los 5 niveles sin huecos', () => {
    expect(NIVELES_RADAR).toHaveLength(5)
  })
})

describe('calcularRadarPeligrosidad', () => {
  it('usa el score del ciclo cuando la privacidad lo permite', () => {
    const r = calcularRadarPeligrosidad({
      scoreCiclo: 7,
      interacciones: [],
      userId: USER,
      partnerId: PARTNER,
      privacidadHormonal: 'todo',
      fechaActual: HOY,
    })
    expect(r.score).toBe(7)
    expect(r.nivel.id).toBe('delicada')
    expect(r.mostrarFase).toBe(true)
  })

  it('nunca baja de 0 ni supera 10', () => {
    const bajo = calcularRadarPeligrosidad({
      scoreCiclo: 0,
      interacciones: [animo('😄')],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    expect(bajo.score).toBe(0)

    const alto = calcularRadarPeligrosidad({
      scoreCiclo: 9,
      interacciones: [alerta('irritable')],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    expect(alto.score).toBe(10)
  })

  it('una alerta explícita sube el puntaje', () => {
    const base = calcularRadarPeligrosidad({
      scoreCiclo: 5,
      interacciones: [],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    const conAlerta = calcularRadarPeligrosidad({
      scoreCiclo: 5,
      interacciones: [alerta('irritable')],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    expect(conAlerta.score).toBeGreaterThan(base.score)
    expect(conAlerta.factores).toContain('alerta:irritable')
  })

  it('un ánimo positivo puede reducir el puntaje', () => {
    const base = calcularRadarPeligrosidad({
      scoreCiclo: 5,
      interacciones: [],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    const conAnimo = calcularRadarPeligrosidad({
      scoreCiclo: 5,
      interacciones: [animo('😄')],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    expect(conAnimo.score).toBeLessThan(base.score)
    expect(conAnimo.factores).toContain('animo:😄')
  })

  it('ignora interacciones expiradas', () => {
    const r = calcularRadarPeligrosidad({
      scoreCiclo: 5,
      interacciones: [alerta('irritable', { expiresAt: '2020-01-01T00:00:00.000Z' })],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    expect(r.score).toBe(5)
    expect(r.factores).not.toContain('alerta:irritable')
  })

  it('ignora interacciones enviadas por el propio usuario', () => {
    const r = calcularRadarPeligrosidad({
      scoreCiclo: 5,
      interacciones: [alerta('irritable', { senderId: USER, receiverId: PARTNER })],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    expect(r.score).toBe(5)
    expect(r.factores).not.toContain('alerta:irritable')
  })

  it('no acumula varias alertas: usa solo la más reciente', () => {
    const r = calcularRadarPeligrosidad({
      scoreCiclo: 5,
      interacciones: [
        alerta('irritable', { createdAt: '2026-07-19T10:00:00.000Z' }),
        alerta('sensible', { createdAt: '2026-07-20T10:00:00.000Z' }),
      ],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    // Solo el ajuste de 'sensible' (+1) debería aplicarse sobre el score base.
    expect(r.score).toBe(6)
    expect(r.factores).toContain('alerta:sensible')
    expect(r.factores).not.toContain('alerta:irritable')
  })

  it('solo_alertas ignora completamente el score del ciclo y no expone fase', () => {
    const r = calcularRadarPeligrosidad({
      scoreCiclo: 9,
      interacciones: [alerta('irritable')],
      userId: USER,
      partnerId: PARTNER,
      privacidadHormonal: 'solo_alertas',
      fechaActual: HOY,
    })
    expect(r.mostrarFase).toBe(false)
    // Base neutral (5) + irritable (+2) = 7, nunca cerca del score crudo del ciclo (9 con redondeo distinto).
    expect(r.score).toBe(7)
    expect(r.factores).not.toContain('ciclo')
  })

  it('funciona con base neutral cuando hay señal compartida pero no hay ciclo', () => {
    const r = calcularRadarPeligrosidad({
      scoreCiclo: null,
      interacciones: [animo('🥰')],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    expect(r.factores).not.toContain('ciclo')
    expect(r.factores).toContain('animo:🥰')
    expect(r.hayInsumos).toBe(true)
  })

  it('sin ninguna señal muestra una presentación neutral', () => {
    const r = calcularRadarPeligrosidad({
      scoreCiclo: null,
      interacciones: [],
      userId: USER,
      partnerId: PARTNER,
      fechaActual: HOY,
    })
    expect(r.hayInsumos).toBe(false)
    expect(r.factores).toEqual([])
    expect(r.mostrarFase).toBe(false)
  })
})
