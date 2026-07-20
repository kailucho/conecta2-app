// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'

const estadoMock = { configurado: true }

vi.mock('./supabaseClient.js', () => ({
  get supabaseConfigurado() {
    return estadoMock.configurado
  },
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}))

import { supabase } from './supabaseClient.js'
import {
  interaccionARemota,
  interaccionALocal,
  enviar,
  responder,
  cancelar,
} from './interactionRepository.js'

beforeEach(() => {
  estadoMock.configurado = true
  vi.clearAllMocks()
})

describe('mapeo local <-> remoto', () => {
  it('interaccionARemota mapea camelCase a columnas snake_case', () => {
    const remota = interaccionARemota({
      id: 'i1',
      coupleId: 'c1',
      senderId: 'u1',
      receiverId: 'u2',
      type: 'quick_action',
      actionId: 'abrazo',
      category: 'gesture',
      note: 'hola',
      valencia: 1,
      status: 'pendiente_sync',
      createdAt: '2026-01-01T00:00:00Z',
    })
    expect(remota).toEqual(expect.objectContaining({
      id: 'i1',
      couple_id: 'c1',
      sender_id: 'u1',
      receiver_id: 'u2',
      type: 'quick_action',
      action_id: 'abrazo',
      status: 'active', // pendiente_sync (local) -> active (funcional remoto)
    }))
  })

  it('interaccionALocal mapea columnas remotas a camelCase local', () => {
    const local = interaccionALocal({
      id: 'i1',
      couple_id: 'c1',
      sender_id: 'u1',
      receiver_id: 'u2',
      type: 'quick_action',
      action_id: 'abrazo',
      status: 'active',
      client_created_at: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:01Z',
    })
    expect(local).toEqual(expect.objectContaining({
      id: 'i1',
      coupleId: 'c1',
      senderId: 'u1',
      receiverId: 'u2',
      status: 'pendiente_sync',
      syncState: 'synced',
    }))
  })
})

describe('operaciones de red', () => {
  it('enviar hace upsert por id y reporta éxito', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    supabase.from.mockReturnValue({ upsert })
    const resultado = await enviar({ id: 'i1', coupleId: 'c1', senderId: 'u1', receiverId: 'u2', type: 'mensaje', status: 'pendiente_sync' })
    expect(resultado.ok).toBe(true)
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ id: 'i1' }), { onConflict: 'id' })
  })

  it('responder marca acknowledged con texto de respuesta', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    supabase.from.mockReturnValue({ update })
    const resultado = await responder('i1', { respuestaTexto: 'gracias' })
    expect(resultado.ok).toBe(true)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'acknowledged', response_text: 'gracias' }))
    expect(eq).toHaveBeenCalledWith('id', 'i1')
  })

  it('cancelar marca status cancelled', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    supabase.from.mockReturnValue({ update })
    const resultado = await cancelar('i1')
    expect(resultado.ok).toBe(true)
    expect(update).toHaveBeenCalledWith({ status: 'cancelled' })
  })

  it('devuelve error controlado si Supabase no está configurado', async () => {
    estadoMock.configurado = false
    const resultado = await enviar({ id: 'i1' })
    expect(resultado).toEqual({ ok: false, motivo: 'supabase_no_configurado' })
  })

  it('propaga un motivo de error cuando Supabase falla', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: { message: 'network down' } })
    supabase.from.mockReturnValue({ upsert })
    const resultado = await enviar({ id: 'i1' })
    expect(resultado.ok).toBe(false)
    expect(resultado.motivo).toBe('error_inesperado')
  })
})
