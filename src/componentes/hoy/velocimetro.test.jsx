// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Velocimetro from './Velocimetro.jsx'
import { pronosticoDelDia } from '../../motor/pronosticoPareja.js'

afterEach(() => cleanup())

function pronosticoDePrueba(overrides = {}) {
  return pronosticoDelDia(new Date('2026-07-20T12:00:00.000Z'), {
    ciclo: { duracionCiclo: 28, duracionRegla: 5, confiable: true },
    fechaUltimaRegla: '2026-07-13', // día ~8 → lútea
    interacciones: [],
    hoy: new Date('2026-07-20T12:00:00.000Z'),
    ...overrides,
  })
}

describe('Velocimetro (Radar de Peligrosidad)', () => {
  it('muestra el título y subtítulo exactos', () => {
    render(<Velocimetro pronostico={pronosticoDePrueba()} tono="normal" semilla={0} />)

    expect(screen.getByText('Radar de peligrosidad')).toBeTruthy()
    expect(screen.getByText('Del día, no de ella 😅')).toBeTruthy()
  })

  it('no muestra la fase cuando mostrarFase es false (privacidad solo_alertas)', () => {
    const pronostico = pronosticoDePrueba({ privacidadHormonal: 'solo_alertas' })
    render(<Velocimetro pronostico={pronostico} tono="normal" semilla={0} />)

    expect(screen.queryByText(/^Fase /)).toBeNull()
  })

  it('incluye una aclaración de que es una guía con humor, no un diagnóstico', () => {
    render(<Velocimetro pronostico={pronosticoDePrueba()} tono="normal" semilla={0} />)

    expect(screen.getByText(/no un diagnóstico/)).toBeTruthy()
  })
})
