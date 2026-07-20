import { describe, expect, it } from 'vitest'
import {
  normalizarTipoRelacion,
  comoLlamarPareja,
  comoLlamarParejaCap,
  convivenJuntos,
  etiquetaTipoRelacion,
  nombresNiveles,
} from './lenguaje.js'

describe('normalizarTipoRelacion', () => {
  it('mapea valores antiguos y nuevos a conviven', () => {
    expect(normalizarTipoRelacion('casados')).toBe('conviven')
    expect(normalizarTipoRelacion('convivientes')).toBe('conviven')
    expect(normalizarTipoRelacion('conviven')).toBe('conviven')
  })

  it('mapea valores antiguos y nuevos a no_conviven', () => {
    expect(normalizarTipoRelacion('novios')).toBe('no_conviven')
    expect(normalizarTipoRelacion('no_conviven')).toBe('no_conviven')
  })

  it('devuelve tal cual cualquier otro valor, sin inventar', () => {
    expect(normalizarTipoRelacion(null)).toBe(null)
    expect(normalizarTipoRelacion(undefined)).toBe(undefined)
    expect(normalizarTipoRelacion('algo_raro')).toBe('algo_raro')
  })
})

describe('comoLlamarPareja / comoLlamarParejaCap', () => {
  it('siempre devuelven lenguaje neutral', () => {
    expect(comoLlamarPareja()).toBe('tu pareja')
    expect(comoLlamarPareja('el', 'casados')).toBe('tu pareja')
    expect(comoLlamarPareja('ella', 'novios')).toBe('tu pareja')
    expect(comoLlamarParejaCap()).toBe('Tu pareja')
  })
})

describe('convivenJuntos', () => {
  it('reconoce valores nuevos', () => {
    expect(convivenJuntos('conviven')).toBe(true)
    expect(convivenJuntos('no_conviven')).toBe(false)
  })

  it('reconoce valores antiguos', () => {
    expect(convivenJuntos('casados')).toBe(true)
    expect(convivenJuntos('convivientes')).toBe(true)
    expect(convivenJuntos('novios')).toBe(false)
  })
})

describe('etiquetaTipoRelacion', () => {
  it('muestra la etiqueta neutral de convivencia', () => {
    expect(etiquetaTipoRelacion('conviven')).toBe('🏠 Viven juntos')
    expect(etiquetaTipoRelacion('no_conviven')).toBe('💌 Aún no viven juntos')
  })

  it('normaliza valores antiguos antes de etiquetar', () => {
    expect(etiquetaTipoRelacion('casados')).toBe('🏠 Viven juntos')
    expect(etiquetaTipoRelacion('novios')).toBe('💌 Aún no viven juntos')
  })

  it('usa un fallback para valores desconocidos', () => {
    expect(etiquetaTipoRelacion(null)).toBe('En pareja')
  })
})

describe('nombresNiveles', () => {
  it('devuelve los 4 niveles neutrales de gamificación', () => {
    expect(nombresNiveles()).toEqual(['Novato', 'Aprendiz', 'Pareja Pro', 'Leyenda de la Conexión'])
    expect(nombresNiveles('el', 'casados')).toEqual(['Novato', 'Aprendiz', 'Pareja Pro', 'Leyenda de la Conexión'])
  })
})
