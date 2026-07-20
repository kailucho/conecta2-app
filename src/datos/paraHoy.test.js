import { describe, it, expect } from 'vitest'
import {
  contenidoParaHoy,
  PREGUNTAS_CONEXION,
} from './paraHoy.js'

describe('contenidoParaHoy', () => {
  it('es determinista: misma semilla ⇒ mismo contenido', () => {
    const opts = { semilla: 42, faseId: 'folicular', hayDatos: true, conviven: true }
    expect(contenidoParaHoy(opts)).toEqual(contenidoParaHoy(opts))
  })

  it('rota entre los 4 tipos cuando hay fase', () => {
    const tipos = new Set()
    for (let s = 0; s < 8; s++) {
      tipos.add(
        contenidoParaHoy({ semilla: s, faseId: 'folicular', hayDatos: true, conviven: true }).tipo,
      )
    }
    expect(tipos).toEqual(new Set(['mision', 'tip', 'pregunta', 'cita']))
  })

  it('nunca muestra "tip" cuando no hay fase', () => {
    for (let s = 0; s < 12; s++) {
      const c = contenidoParaHoy({ semilla: s, faseId: null, hayDatos: false, conviven: false })
      expect(c.tipo).not.toBe('tip')
    }
  })

  it('la misión trae acción "completar" y puntos', () => {
    // semilla 0 → índice 0 de la rotación con fase = 'mision'
    const c = contenidoParaHoy({ semilla: 0, faseId: 'folicular', hayDatos: true, conviven: true })
    expect(c.tipo).toBe('mision')
    expect(c.accion).toBe('completar')
    expect(c.puntos).toBe(20)
  })

  it('la pregunta proviene de PREGUNTAS_CONEXION', () => {
    // semilla 2 → índice 2 con fase = 'pregunta'
    const c = contenidoParaHoy({ semilla: 2, faseId: 'folicular', hayDatos: true, conviven: true })
    expect(c.tipo).toBe('pregunta')
    expect(PREGUNTAS_CONEXION).toContain(c.texto)
    expect(c.accion).toBe('enviar_pregunta')
  })
})
