import { describe, expect, it } from 'vitest'
import { mensajePreparado } from './mensajesWhatsApp.js'

describe('mensajePreparado', () => {
  it('es determinista para la misma acción/tono/semilla', () => {
    const a = mensajePreparado('hambre', 'divertido', 5)
    const b = mensajePreparado('hambre', 'divertido', 5)
    expect(a).toBe(b)
  })

  it('devuelve un mensaje no vacío para cada tono soportado', () => {
    ;['suave', 'divertido', 'directo', 'sinfiltro'].forEach((tono) => {
      expect(mensajePreparado('abrazo', tono, 1)).toBeTruthy()
    })
  })

  it('devuelve un mensaje genérico para acciones desconocidas', () => {
    expect(mensajePreparado('accion_inexistente', 'divertido', 0)).toBeTruthy()
  })
})
