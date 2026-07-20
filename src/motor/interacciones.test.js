import { describe, expect, it } from 'vitest'
import { interaccionEntranteMasReciente } from './interacciones.js'

const USER = 'user-1'
const PARTNER = 'partner-1'

describe('interaccionEntranteMasReciente', () => {
  it('devuelve null si no hay interacciones entrantes', () => {
    expect(interaccionEntranteMasReciente([], USER, PARTNER)).toBeNull()
  })

  it('ignora interacciones enviadas por el propio usuario', () => {
    const salida = [
      { id: '1', senderId: USER, receiverId: PARTNER, createdAt: '2026-07-20T10:00:00Z' },
    ]
    expect(interaccionEntranteMasReciente(salida, USER, PARTNER)).toBeNull()
  })

  it('devuelve la entrante más reciente por createdAt', () => {
    const lista = [
      { id: 'vieja', senderId: PARTNER, receiverId: USER, createdAt: '2026-07-19T10:00:00Z' },
      { id: 'nueva', senderId: PARTNER, receiverId: USER, createdAt: '2026-07-20T10:00:00Z' },
    ]
    expect(interaccionEntranteMasReciente(lista, USER, PARTNER).id).toBe('nueva')
  })
})
