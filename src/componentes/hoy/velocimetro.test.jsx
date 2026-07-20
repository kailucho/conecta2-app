// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Velocimetro from './Velocimetro.jsx'
import { calcularRadarPeligrosidad } from '../../motor/radarPeligrosidad.js'

afterEach(() => cleanup())

describe('Velocimetro (Radar de Peligrosidad)', () => {
  it('muestra el título y subtítulo exactos', () => {
    const radar = calcularRadarPeligrosidad({ scoreCiclo: 5, interacciones: [] })
    render(<Velocimetro radar={radar} fase={{ id: 'lutea', nombre: 'Lútea' }} tono="normal" semilla={0} />)

    expect(screen.getByText('Radar de peligrosidad')).toBeTruthy()
    expect(screen.getByText('Del día, no de ella 😅')).toBeTruthy()
  })

  it('no muestra la fase cuando mostrarFase es false (privacidad solo_alertas)', () => {
    const radar = calcularRadarPeligrosidad({
      scoreCiclo: 8,
      interacciones: [],
      privacidadHormonal: 'solo_alertas',
    })
    render(<Velocimetro radar={radar} fase={null} tono="normal" semilla={0} />)

    expect(screen.queryByText(/^Fase /)).toBeNull()
  })

  it('incluye una aclaración de que es una guía con humor, no un diagnóstico', () => {
    const radar = calcularRadarPeligrosidad({ scoreCiclo: 3, interacciones: [] })
    render(<Velocimetro radar={radar} fase={{ id: 'folicular', nombre: 'Folicular' }} tono="normal" semilla={0} />)

    expect(screen.getByText(/no un diagnóstico/)).toBeTruthy()
  })
})
