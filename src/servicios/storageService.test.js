// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  CLAVES,
  guardar,
  migrarVinculacionLegada,
  obtener,
} from './storageService.js'

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('persistencia de fecha de calendario', () => {
  it('mantiene exactamente el mismo día después de guardar y recargar', async () => {
    await guardar(CLAVES.ciclo, { registrosRegla: [{ fechaInicio: '2026-07-19' }] })
    const ciclo = await obtener(CLAVES.ciclo)
    expect(ciclo.registrosRegla[0].fechaInicio).toBe('2026-07-19')
  })
})

describe('migrarVinculacionLegada', () => {
  it('invalida IDs ficticios, conserva interacciones y limpia la cola', async () => {
    const perfil = { userId: 'u1', coupleId: 'c-falso', partnerId: 'p-falso' }
    const interacciones = [
      {
        id: 'i1',
        coupleId: 'c-falso',
        senderId: 'u1',
        receiverId: 'p-falso',
        status: 'pendiente_sync',
        type: 'mensaje',
      },
      { id: 'i-local', status: 'local', type: 'registro' },
    ]
    await guardar(CLAVES.perfil, perfil)
    await guardar(CLAVES.interacciones, interacciones)
    await guardar(CLAVES.colaSalida, ['i1'])

    const primera = await migrarVinculacionLegada()
    expect(primera.migrado).toBe(true)
    expect(await obtener(CLAVES.perfil)).toEqual(expect.objectContaining({
      coupleId: null,
      partnerId: null,
      estadoVinculacion: 'no_vinculada',
    }))
    const guardadas = await obtener(CLAVES.interacciones)
    expect(guardadas).toHaveLength(2)
    expect(guardadas[0]).toEqual(expect.objectContaining({
      id: 'i1',
      receiverId: null,
      coupleId: null,
      status: 'no_enviado_legacy',
    }))
    expect(await obtener(CLAVES.colaSalida)).toEqual([])

    const foto = JSON.stringify({
      perfil: await obtener(CLAVES.perfil),
      interacciones: await obtener(CLAVES.interacciones),
      cola: await obtener(CLAVES.colaSalida),
    })
    expect((await migrarVinculacionLegada()).migrado).toBe(false)
    expect(JSON.stringify({
      perfil: await obtener(CLAVES.perfil),
      interacciones: await obtener(CLAVES.interacciones),
      cola: await obtener(CLAVES.colaSalida),
    })).toBe(foto)
  })

  it('no deshace una cuenta ya marcada explícitamente como vinculada', async () => {
    const perfil = {
      userId: 'u1',
      coupleId: 'c1',
      partnerId: 'u2',
      estadoVinculacion: 'vinculada',
    }
    await guardar(CLAVES.perfil, perfil)
    await guardar(CLAVES.colaSalida, ['real'])
    expect((await migrarVinculacionLegada()).migrado).toBe(false)
    expect(await obtener(CLAVES.perfil)).toEqual(perfil)
    expect(await obtener(CLAVES.colaSalida)).toEqual(['real'])
  })
})
