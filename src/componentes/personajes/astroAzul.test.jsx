// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import AstroAzul from './AstroAzul.jsx'
import { EXPRESIONES } from '../../motor/expresiones.js'

afterEach(() => cleanup())

describe('AstroAzul', () => {
  it('asigna los accesorios recibidos según el nivel del radar', () => {
    const { container } = render(<AstroAzul accesorios={['casco', 'escudo']} />)
    expect(container.querySelectorAll('svg > path, svg > g').length).toBeGreaterThan(0)
    // Ambos accesorios deben renderizar sin lanzar error y sin duplicar el svg base.
    expect(container.querySelectorAll('svg').length).toBe(1)
  })

  it('no rota (flota) cuando animar es false, respetando reducirMovimiento', () => {
    const { container } = render(<AstroAzul animar={false} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('class')).not.toContain('animate-flotar-suave')
  })

  it('flota cuando animar es true y la expresión no es de descanso', () => {
    const { container } = render(<AstroAzul animar expresion={EXPRESIONES.feliz} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('class')).toContain('animate-flotar-suave')
  })

  it('no flota en expresión de cansancio aunque animar sea true', () => {
    const { container } = render(<AstroAzul animar expresion={EXPRESIONES.cansado} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('class')).not.toContain('animate-flotar-suave')
  })
})
