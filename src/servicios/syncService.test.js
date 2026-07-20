import { describe, expect, it } from 'vitest'
import { parejaVinculada, vinculacionDisponible } from './syncService.js'

describe('parejaVinculada', () => {
  it.each([
    null,
    {},
    { coupleId: 'c', partnerId: 'p' },
    { estadoVinculacion: 'no_vinculada', coupleId: 'c', partnerId: 'p' },
    {
      userId: 'u1',
      coupleId: 'c1',
      partnerId: 'u1',
      estadoVinculacion: 'vinculada',
    },
  ])('devuelve false para un perfil no vinculado o inconsistente', (perfil) => {
    expect(parejaVinculada(perfil)).toBe(false)
  })

  it('solo devuelve true con estado explícito e IDs distintos', () => {
    expect(parejaVinculada({
      userId: 'u1',
      coupleId: 'c1',
      partnerId: 'u2',
      estadoVinculacion: 'vinculada',
    })).toBe(true)
  })

  it('declara que la conexión real no está disponible sin Supabase configurado', () => {
    expect(vinculacionDisponible()).toBe(false)
  })
})
