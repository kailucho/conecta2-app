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
    fireEvent.click(screen.getByText('Sí, vivimos juntos'))
    fireEvent.click(screen.getByText('Continuar'))

    expect(screen.getByText('¿Cuál fue el primer día de tu última menstruación?')).toBeTruthy()
    expect(screen.getByText(/comenzó el sangrado, no el día en que terminó/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '29' } })
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '02' } })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2024' } })
    fireEvent.click(screen.getByText('Continuar'))

    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(screen.getByText('Entrar a la app'))

    await waitFor(() => expect(JSON.parse(localStorage.getItem('mp:perfil'))).toEqual(
      expect.objectContaining({
        coupleId: null,
        partnerId: null,
        estadoVinculacion: 'no_vinculada',
        tipoRelacion: 'conviven',
        privacidadHormonal: 'todo',
      }),
    ))
    const ciclo = JSON.parse(localStorage.getItem('mp:ciclo'))
    expect(ciclo.registrosRegla[0].fechaInicio).toBe('2024-02-29')
  })

  it('pregunta solo si viven juntos: dos opciones, sin "cómo llamar"', async () => {
    render(<ProveedorApp><App /></ProveedorApp>)
    fireEvent.click(await screen.findByText('Empezar'))
    fireEvent.click(screen.getByText('Él'))
    fireEvent.click(screen.getByText('Continuar'))

    expect(screen.getByText('¿Viven juntos?')).toBeTruthy()
    expect(screen.getByText('Sí, vivimos juntos')).toBeTruthy()
    expect(screen.getByText('Aún no vivimos juntos')).toBeTruthy()
    expect(screen.queryByText('Casados')).toBeNull()
    expect(screen.queryByText('Convivientes')).toBeNull()
    expect(screen.queryByText('Enamorados')).toBeNull()
    expect(screen.queryByText(/cómo prefieren que la app los llame/i)).toBeNull()
  })

  it('guarda el perfil con no_conviven cuando aún no viven juntos', async () => {
    render(<ProveedorApp><App /></ProveedorApp>)
    fireEvent.click(await screen.findByText('Empezar'))
    fireEvent.click(screen.getByText('Él'))
    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(screen.getByText('Aún no vivimos juntos'))
    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(screen.getByText('No lo sé ahora, lo pongo después'))
    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(await screen.findByText('Entrar a la app'))

    await waitFor(() => expect(JSON.parse(localStorage.getItem('mp:perfil'))).toEqual(
      expect.objectContaining({ tipoRelacion: 'no_conviven' }),
    ))
  })

  it('no pregunta por la privacidad hormonal: siempre se comparte todo', async () => {
    render(<ProveedorApp><App /></ProveedorApp>)
    fireEvent.click(await screen.findByText('Empezar'))
    fireEvent.click(screen.getByText('Ella'))
    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(screen.getByText('Sí, vivimos juntos'))
    fireEvent.click(screen.getByText('Continuar'))
    fireEvent.click(screen.getByText('No lo sé ahora, lo pongo después'))
    fireEvent.click(screen.getByText('Continuar'))

    expect(screen.queryByText('Tu privacidad 🔒')).toBeNull()
    expect(screen.queryByText('Solo alertas')).toBeNull()
    fireEvent.click(await screen.findByText('Entrar a la app'))

    await waitFor(() => expect(JSON.parse(localStorage.getItem('mp:perfil'))).toEqual(
      expect.objectContaining({ privacidadHormonal: 'todo' }),
    ))
  })
})
