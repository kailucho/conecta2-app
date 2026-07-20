// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const upsertPerfilMock = vi.fn()
vi.mock('./profileService.js', () => ({
  upsertPerfil: (...args) => upsertPerfilMock(...args),
}))

import { CLAVES, guardar, obtener } from './storageService.js'
import { migrarSiHaceFalta } from './migracionLocal.js'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
afterEach(() => localStorage.clear())

describe('migrarSiHaceFalta', () => {
  it('asocia el userId local al usuario autenticado y sube el perfil remoto', async () => {
    await guardar(CLAVES.perfil, { userId: 'local-123', rol: 'ella', nombre: 'Ana' })
    upsertPerfilMock.mockResolvedValue({ ok: true, perfil: {} })

    const resultado = await migrarSiHaceFalta('auth-uid-1')
    expect(resultado.migrado).toBe(true)

    const perfil = await obtener(CLAVES.perfil)
    expect(perfil.userId).toBe('auth-uid-1')
    expect(perfil.legacyLocalUserId).toBe('local-123')
    expect(upsertPerfilMock).toHaveBeenCalledTimes(1)
  })

  it('no se ejecuta dos veces para el mismo usuario', async () => {
    await guardar(CLAVES.perfil, { userId: 'local-123', rol: 'ella' })
    upsertPerfilMock.mockResolvedValue({ ok: true, perfil: {} })

    await migrarSiHaceFalta('auth-uid-1')
    const resultado = await migrarSiHaceFalta('auth-uid-1')

    expect(resultado.migrado).toBe(false)
    expect(resultado.motivo).toBe('ya_migrado')
    expect(upsertPerfilMock).toHaveBeenCalledTimes(1)
  })

  it('vuelve a migrar si cambia el usuario autenticado (otra cuenta en el mismo dispositivo)', async () => {
    await guardar(CLAVES.perfil, { userId: 'local-123', rol: 'ella' })
    upsertPerfilMock.mockResolvedValue({ ok: true, perfil: {} })

    await migrarSiHaceFalta('auth-uid-1')
    const resultado = await migrarSiHaceFalta('auth-uid-2')

    expect(resultado.migrado).toBe(true)
    expect(upsertPerfilMock).toHaveBeenCalledTimes(2)
  })
})
