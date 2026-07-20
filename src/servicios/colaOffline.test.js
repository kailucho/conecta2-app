// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./supabaseClient.js', () => ({ supabaseConfigurado: true }))

const enviarMock = vi.fn()
const responderMock = vi.fn()
const cancelarMock = vi.fn()
vi.mock('./interactionRepository.js', () => ({
  enviar: (...args) => enviarMock(...args),
  responder: (...args) => responderMock(...args),
  cancelar: (...args) => cancelarMock(...args),
}))

import { CLAVES, agregarOperacion, listarOperaciones, guardar } from './storageService.js'
import { drenarCola } from './colaOffline.js'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
afterEach(() => localStorage.clear())

describe('drenarCola', () => {
  it('procesa una operación exitosa y la elimina de la cola', async () => {
    enviarMock.mockResolvedValue({ ok: true })
    await agregarOperacion({ entity: 'interactions', action: 'insert', entityId: 'i1', payload: { id: 'i1' } })

    const resultado = await drenarCola()
    expect(resultado.procesadas).toBe(1)
    expect(await listarOperaciones()).toHaveLength(0)
  })

  it('reintenta y guarda lastError cuando falla, sin eliminar la operación', async () => {
    enviarMock.mockResolvedValue({ ok: false, motivo: 'error_inesperado' })
    await agregarOperacion({ entity: 'interactions', action: 'insert', entityId: 'i1', payload: { id: 'i1' } })

    await drenarCola()
    const cola = await listarOperaciones()
    expect(cola).toHaveLength(1)
    expect(cola[0].attempts).toBe(1)
    expect(cola[0].lastError).toBe('error_inesperado')
  })

  it('deduplica operaciones repetidas para la misma entidad, conservando la más reciente', async () => {
    enviarMock.mockResolvedValue({ ok: true })
    await agregarOperacion({ entity: 'interactions', action: 'insert', entityId: 'i1', payload: { id: 'i1', note: 'v1' } })
    await agregarOperacion({ entity: 'interactions', action: 'insert', entityId: 'i1', payload: { id: 'i1', note: 'v2' } })

    await drenarCola()
    expect(enviarMock).toHaveBeenCalledTimes(1)
    expect(enviarMock).toHaveBeenCalledWith(expect.objectContaining({ note: 'v2' }))
  })

  it('no reintenta una operación que ya alcanzó el máximo de intentos', async () => {
    const op = await agregarOperacion({ entity: 'interactions', action: 'insert', entityId: 'i1', payload: { id: 'i1' } })
    const cola = await listarOperaciones()
    cola[0] = { ...cola[0], attempts: 6 }
    await guardar(CLAVES.colaOperaciones, cola)

    await drenarCola()
    expect(enviarMock).not.toHaveBeenCalled()
    expect((await listarOperaciones())[0].operationId).toBe(op.operationId)
  })

  it('enruta acciones update a responder o cancelar según el payload', async () => {
    responderMock.mockResolvedValue({ ok: true })
    cancelarMock.mockResolvedValue({ ok: true })
    await agregarOperacion({ entity: 'interactions', action: 'update', entityId: 'i1', payload: { respuestaTexto: 'ok' } })
    await agregarOperacion({ entity: 'interactions', action: 'update', entityId: 'i2', payload: { tipo: 'cancelar' } })

    await drenarCola()
    expect(responderMock).toHaveBeenCalledWith('i1', { respuestaTexto: 'ok' })
    expect(cancelarMock).toHaveBeenCalledWith('i2')
  })
})
