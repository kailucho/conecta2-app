// @vitest-environment jsdom
// La bandeja resuelve y renderiza cualquier tipo de interacción recibida.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { ProveedorApp } from '../../contexto/AppContexto.jsx'
import BandejaPareja from './BandejaPareja.jsx'

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

function sembrar(interacciones) {
  localStorage.setItem(
    'mp:perfil',
    JSON.stringify({
      userId: 'u-me',
      coupleId: 'c',
      partnerId: 'u-other',
      rol: 'ella',
      tipoRelacion: 'casados',
      nombre: 'Yo',
      tonoHumor: 'normal',
      privacidadHormonal: 'todo',
    }),
  )
  localStorage.setItem('mp:interacciones', JSON.stringify(interacciones))
}

function recibida(extra) {
  return {
    id: `i-${Math.random()}`,
    createdAt: new Date().toISOString(),
    status: 'pendiente_sync',
    coupleId: 'c',
    senderId: 'u-other',
    receiverId: 'u-me',
    ...extra,
  }
}

async function montar() {
  render(
    <ProveedorApp>
      <BandejaPareja />
    </ProveedorApp>,
  )
}

describe('BandejaPareja', () => {
  it('renderiza un mensaje libre recibido con respuestas genéricas', async () => {
    sembrar([recibida({ type: 'mensaje', note: 'te amo', valencia: 1 })])
    await montar()
    await waitFor(() => expect(screen.getByText(/Te escribió un mensajito/)).toBeTruthy())
    expect(screen.getByText(/"te amo"/)).toBeTruthy()
    expect(screen.getByText('🫂 Aquí estoy')).toBeTruthy()
  })

  it('renderiza un ánimo recibido mostrando el emoji', async () => {
    sembrar([recibida({ type: 'animo', actionId: '🥰', valencia: 1 })])
    await montar()
    await waitFor(() => expect(screen.getByText(/Te compartió su ánimo/)).toBeTruthy())
  })

  it('responder marca la interacción como acknowledged y desaparece', async () => {
    sembrar([recibida({ type: 'aprecio', note: 'me hiciste reír', valencia: 1 })])
    await montar()
    await waitFor(() => expect(screen.getByText(/Reconoció algo lindo de ti/)).toBeTruthy())

    fireEvent.click(screen.getByText('💛 Qué lindo'))

    await waitFor(() => {
      const guardado = JSON.parse(localStorage.getItem('mp:interacciones'))
      expect(guardado[0].status).toBe('acknowledged')
    })
  })
})
