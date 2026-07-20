// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./supabaseClient.js', () => ({
  supabaseConfigurado: true,
  supabase: { rpc: vi.fn(), from: vi.fn() },
}))

import { supabase } from './supabaseClient.js'
import { registrarEvento, resumenPareja } from './gamificationRepository.js'

beforeEach(() => vi.clearAllMocks())

describe('registrarEvento', () => {
  it('deriva el event_type del prefijo de la clave y pasa la clave como dedupe_key', async () => {
    supabase.rpc.mockResolvedValue({ data: [{ awarded: true, points: 15 }], error: null })
    const resultado = await registrarEvento('aprecio:2026-07-20')
    expect(resultado).toEqual({ ok: true, otorgado: true, puntos: 15 })
    expect(supabase.rpc).toHaveBeenCalledWith('award_points', {
      p_event_type: 'aprecio',
      p_dedupe_key: 'aprecio:2026-07-20',
      p_interaction_id: null,
    })
  })

  it('reporta otorgado:false cuando el servidor deduplicó (ya se había otorgado)', async () => {
    supabase.rpc.mockResolvedValue({ data: [{ awarded: false, points: 0 }], error: null })
    const resultado = await registrarEvento('deseo:d1')
    expect(resultado).toEqual({ ok: true, otorgado: false, puntos: 0 })
  })

  it('rechaza un evento no permitido devuelto como error del RPC', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'evento_no_permitido' } })
    const resultado = await registrarEvento('inventado:x')
    expect(resultado.ok).toBe(false)
  })
})

describe('resumenPareja', () => {
  it('agrega los puntos por usuario y deriva el nivel', async () => {
    const eq = vi.fn().mockResolvedValue({
      data: [
        { user_id: 'u1', points: 15 },
        { user_id: 'u1', points: 5 },
        { user_id: 'u2', points: 100 },
      ],
      error: null,
    })
    supabase.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) })

    const resultado = await resumenPareja('c1')
    expect(resultado.ok).toBe(true)
    expect(resultado.porUsuario.u1).toEqual({ puntos: 20, nivel: 0 })
    expect(resultado.porUsuario.u2).toEqual({ puntos: 100, nivel: 1 })
  })
})
