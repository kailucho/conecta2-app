// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ProveedorApp } from '../contexto/AppContexto.jsx'
import App from '../App.jsx'

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Onboarding', () => {
  it('solicita el primer día, guarda ISO y crea un perfil no vinculado', async () => {
    render(<ProveedorApp><App /></ProveedorApp>)
    fireEvent.click(await screen.findByText('Empezar'))
    fireEvent.click(screen.getByText('Ella'))
    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(screen.getByText('Casados'))
    fireEvent.click(screen.getByText('Continuar'))

    expect(screen.getByText('¿Cuál fue el primer día de tu última menstruación?')).toBeTruthy()
    expect(screen.getByText(/comenzó el sangrado, no el día en que terminó/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '29' } })
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '02' } })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2024' } })
    fireEvent.click(screen.getByText('Continuar'))

    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(screen.getByText('Entrar a la app'))

    await waitFor(() => expect(JSON.parse(localStorage.getItem('mp:perfil'))).toEqual(
      expect.objectContaining({
        coupleId: null,
        partnerId: null,
        estadoVinculacion: 'no_vinculada',
      }),
    ))
    const ciclo = JSON.parse(localStorage.getItem('mp:ciclo'))
    expect(ciclo.registrosRegla[0].fechaInicio).toBe('2024-02-29')
  })
})
