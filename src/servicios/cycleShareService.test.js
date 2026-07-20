// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./supabaseClient.js', () => ({
  supabaseConfigurado: true,
  supabase: { from: vi.fn(), rpc: vi.fn() },
}))

import { supabase } from './supabaseClient.js'
import { derivarSnapshot, publicarSnapshot, responderSugerencia, sugerirRegla } from './cycleShareService.js'

const CICLO_BASE = {
  duracionCiclo: 28,
  duracionRegla: 5,
  registrosRegla: [{ id: 'r1', fechaInicio: '2026-07-01' }],
  etapaVida: 'regular',
}

beforeEach(() => vi.clearAllMocks())

describe('derivarSnapshot', () => {
  it('con privacidad "todo" expone fase y día del ciclo', () => {
    const s = derivarSnapshot(CICLO_BASE, 'todo')
    expect(s.privacy_level).toBe('todo')
    expect(s.visible_phase).toBeTruthy()
    expect(typeof s.cycle_day).toBe('number')
  })

  it('con privacidad "solo_fases" expone la fase pero no el día', () => {
    const s = derivarSnapshot(CICLO_BASE, 'solo_fases')
    expect(s.visible_phase).toBeTruthy()
    expect(s.cycle_day).toBeNull()
  })

  it('con privacidad "solo_alertas" nunca expone fase ni día', () => {
    const s = derivarSnapshot(CICLO_BASE, 'solo_alertas')
    expect(s.visible_phase).toBeNull()
    expect(s.cycle_day).toBeNull()
    expect(typeof s.general_alert).toBe('boolean')
  })

  it('devuelve null si no hay datos de ciclo o está en menopausia', () => {
    expect(derivarSnapshot({ registrosRegla: [] }, 'todo')).toBeNull()
    expect(derivarSnapshot({ ...CICLO_BASE, etapaVida: 'menopausia' }, 'todo')).toBeNull()
  })
})

describe('publicarSnapshot', () => {
  it('hace upsert con owner_user_id y couple_id del perfil', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    supabase.from.mockReturnValue({ upsert })
    const perfil = { userId: 'u1', coupleId: 'c1', privacidadHormonal: 'todo' }
    const resultado = await publicarSnapshot(CICLO_BASE, perfil)
    expect(resultado.ok).toBe(true)
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ owner_user_id: 'u1', couple_id: 'c1' }),
      { onConflict: 'owner_user_id,couple_id' },
    )
  })

  it('no falla si no hay pareja vinculada: devuelve motivo controlado', async () => {
    const resultado = await publicarSnapshot(CICLO_BASE, { userId: 'u1' })
    expect(resultado).toEqual({ ok: false, motivo: 'sin_pareja_vinculada' })
  })
})

describe('sugerirRegla y responderSugerencia', () => {
  it('inserta una sugerencia con couple_id y owner_user_id', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'sug1' }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    supabase.from.mockReturnValue({ insert })
    const resultado = await sugerirRegla('c1', 'u2', '2026-07-20')
    expect(resultado).toEqual({ ok: true, id: 'sug1' })
    expect(insert).toHaveBeenCalledWith({ couple_id: 'c1', owner_user_id: 'u2', suggested_start_date: '2026-07-20' })
  })

  it('responderSugerencia llama al RPC con el id y la decisión', async () => {
    supabase.rpc.mockResolvedValue({ error: null })
    const resultado = await responderSugerencia('sug1', true)
    expect(resultado).toEqual({ ok: true })
    expect(supabase.rpc).toHaveBeenCalledWith('respond_period_suggestion', { p_id: 'sug1', p_aceptar: true })
  })
})
