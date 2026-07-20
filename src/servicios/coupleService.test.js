// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./supabaseClient.js', () => ({
  supabaseConfigurado: true,
  supabase: {
    rpc: vi.fn(),
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}))

import { supabase } from './supabaseClient.js'
import { crearInvitacion, aceptarInvitacion, salirPareja } from './coupleService.js'

beforeEach(() => vi.clearAllMocks())

describe('crearInvitacion', () => {
  it('devuelve el código, coupleId y expiración cuando el RPC tiene éxito', async () => {
    supabase.rpc.mockResolvedValue({
      data: [{ code: 'ABC123', couple_id: 'c1', expires_at: '2026-08-01T00:00:00Z' }],
      error: null,
    })
    const resultado = await crearInvitacion()
    expect(resultado).toEqual({ ok: true, codigo: 'ABC123', coupleId: 'c1', expiraEl: '2026-08-01T00:00:00Z' })
    expect(supabase.rpc).toHaveBeenCalledWith('create_couple_invite')
  })

  it('mapea el error del RPC a un motivo conocido', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'usuario_ya_vinculado' } })
    const resultado = await crearInvitacion()
    expect(resultado).toEqual({ ok: false, motivo: 'usuario_ya_vinculado' })
  })
})

describe('aceptarInvitacion', () => {
  it('rechaza un código expirado con el motivo del servidor', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'codigo_expirado' } })
    const resultado = await aceptarInvitacion('ABC123')
    expect(resultado).toEqual({ ok: false, motivo: 'codigo_expirado' })
    expect(supabase.rpc).toHaveBeenCalledWith('accept_couple_invite', { p_code: 'ABC123' })
  })

  it('impide vincularse a una pareja ya completa', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'pareja_completa' } })
    const resultado = await aceptarInvitacion('ABC123')
    expect(resultado.motivo).toBe('pareja_completa')
  })

  it('acepta correctamente y devuelve el coupleId', async () => {
    supabase.rpc.mockResolvedValue({ data: [{ couple_id: 'c1' }], error: null })
    const resultado = await aceptarInvitacion('ABC123')
    expect(resultado).toEqual({ ok: true, coupleId: 'c1' })
  })
})

describe('salirPareja', () => {
  it('desvincula correctamente', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null })
    const resultado = await salirPareja()
    expect(resultado).toEqual({ ok: true })
    expect(supabase.rpc).toHaveBeenCalledWith('leave_couple')
  })
})
