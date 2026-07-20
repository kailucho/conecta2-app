// @vitest-environment jsdom
// El compositor de mensaje crea una interacción de type 'mensaje'.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { ProveedorApp, usarApp } from '../../contexto/AppContexto.jsx'
import MensajeLibre from './MensajeLibre.jsx'

beforeEach(() => {
  window.matchMedia = window.matchMedia || (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

function sembrar() {
  localStorage.setItem(
    'mp:perfil',
    JSON.stringify({
      userId: 'u-me',
      coupleId: 'c',
      partnerId: 'u-other',
      estadoVinculacion: 'vinculada',
      rol: 'ella',
      tipoRelacion: 'conviven',
      nombre: 'Yo',
      tonoHumor: 'normal',
      privacidadHormonal: 'todo',
    }),
  )
}

function sembrarSinPareja() {
  localStorage.setItem(
    'mp:perfil',
    JSON.stringify({
      userId: 'u-me',
      coupleId: null,
      partnerId: null,
      estadoVinculacion: 'no_vinculada',
      rol: 'ella',
      tipoRelacion: 'conviven',
    }),
  )
}

function Harness() {
  const { cargando, solicitudVinculacion } = usarApp()
  if (cargando) return null
  return (
    <>
      <MensajeLibre abierto alCerrar={() => {}} onReaccion={() => {}} />
      {solicitudVinculacion && <output>requiere-vinculacion</output>}
    </>
  )
}

async function montar() {
  render(
    <ProveedorApp>
      <Harness />
    </ProveedorApp>,
  )
  await waitFor(() => expect(screen.getByPlaceholderText(/Escríbele algo bonito/)).toBeTruthy())
}

function interacciones() {
  return JSON.parse(localStorage.getItem('mp:interacciones') || '[]')
}

describe('MensajeLibre', () => {
  it('escribir y enviar crea una interacción type mensaje', async () => {
    sembrar()
    await montar()
    fireEvent.change(screen.getByPlaceholderText(/Escríbele algo bonito/), {
      target: { value: 'te amo mucho' },
    })
    fireEvent.click(screen.getByText('Enviar 💌'))

    await waitFor(() => expect(interacciones().length).toBe(1))
    const it0 = interacciones()[0]
    expect(it0.type).toBe('mensaje')
    expect(it0.note).toBe('te amo mucho')
    expect(it0.valencia).toBe(1)
  })

  it('mantiene el foco mientras se escribe letra por letra', async () => {
    sembrar()
    await montar()
    const textarea = screen.getByPlaceholderText(/Escríbele algo bonito/)
    textarea.focus()

    for (const valor of ['t', 'te', 'te amo']) {
      fireEvent.change(textarea, { target: { value: valor } })
      expect(document.activeElement).toBe(textarea)
      expect(textarea.value).toBe(valor)
    }
  })

  it('una frase sugerida rellena el texto y requiere confirmar', async () => {
    sembrar()
    await montar()
    // Elegir una frase no envía por sí sola.
    fireEvent.click(screen.getByText(/Solo quería decirte que te amo/))
    expect(interacciones().length).toBe(0)
    // Confirmar sí envía.
    fireEvent.click(screen.getByText('Enviar 💌'))
    await waitFor(() => expect(interacciones().length).toBe(1))
    expect(interacciones()[0].type).toBe('mensaje')
  })

  it('sin pareja conserva el texto y no simula que fue enviado', async () => {
    sembrarSinPareja()
    await montar()
    const textarea = screen.getByPlaceholderText(/Escríbele algo bonito/)
    fireEvent.change(textarea, { target: { value: 'Te extraño' } })
    fireEvent.click(screen.getByText('Enviar 💌'))

    await screen.findByText('requiere-vinculacion')
    expect(interacciones()).toEqual([])
    expect(textarea.value).toBe('Te extraño')
    expect(screen.queryByText('¡Mensaje enviado!')).toBeNull()
  })
})
