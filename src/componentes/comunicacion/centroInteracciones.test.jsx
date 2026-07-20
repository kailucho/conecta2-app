// @vitest-environment jsdom
// El centro de interacciones mapea cada flujo a los tipos de interacción
// correctos, sin romper el modelo de datos.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { ProveedorApp, usarApp } from '../../contexto/AppContexto.jsx'
import CentroInteracciones from './CentroInteracciones.jsx'

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
      tipoRelacion: 'casados',
      nombre: 'Yo',
      tonoHumor: 'normal',
      privacidadHormonal: 'todo',
    }),
  )
}

// Espera a que el contexto hidrate el perfil antes de montar el centro.
function Harness() {
  const { cargando } = usarApp()
  if (cargando) return null
  return (
    <CentroInteracciones
      abierto
      alCerrar={() => {}}
      onReaccion={() => {}}
      irA={() => {}}
      alAbrirMensaje={() => {}}
    />
  )
}

async function montar() {
  render(
    <ProveedorApp>
      <Harness />
    </ProveedorApp>,
  )
  await waitFor(() => expect(screen.getByText('Cómo me siento')).toBeTruthy())
}

function interacciones() {
  return JSON.parse(localStorage.getItem('mp:interacciones') || '[]')
}

describe('CentroInteracciones', () => {
  it('muestra las 4 categorías', async () => {
    sembrar()
    await montar()
    expect(screen.getByText('Cómo me siento')).toBeTruthy()
    expect(screen.getByText('Necesito algo')).toBeTruthy()
    expect(screen.getByText('Quiero darte cariño')).toBeTruthy()
    expect(screen.getByText('Hagamos algo juntos')).toBeTruthy()
  })

  it('emoción negativa + necesidad ⇒ alerta_estado con nota', async () => {
    sembrar()
    await montar()
    fireEvent.click(screen.getByText('Cómo me siento'))
    fireEvent.click(await screen.findByText('Cansado/a'))
    fireEvent.click(await screen.findByText('Quiero cariño'))

    await waitFor(() => expect(interacciones().length).toBe(1))
    const it0 = interacciones()[0]
    expect(it0.type).toBe('alerta_estado')
    expect(it0.actionId).toBe('sin_bateria')
    expect(it0.valencia).toBe(0)
    expect(it0.expiresAt).toBeTruthy()
    expect(it0.note).toBe('Quiero cariño')
  })

  it('emoción positiva ⇒ animo con valencia 1', async () => {
    sembrar()
    await montar()
    fireEvent.click(screen.getByText('Cómo me siento'))
    fireEvent.click(await screen.findByText('Bien'))
    fireEvent.click(await screen.findByText(/Enviar solo mi estado/))

    await waitFor(() => expect(interacciones().length).toBe(1))
    const it0 = interacciones()[0]
    expect(it0.type).toBe('animo')
    expect(it0.valencia).toBe(1)
  })

  it('necesidad frecuente ⇒ quick_action', async () => {
    sembrar()
    await montar()
    fireEvent.click(screen.getByText('Necesito algo'))
    fireEvent.click(await screen.findByText('Necesito un abrazo'))
    fireEvent.click(await screen.findByText('Enviar 💌'))

    await waitFor(() => expect(interacciones().length).toBe(1))
    const it0 = interacciones()[0]
    expect(it0.type).toBe('quick_action')
    expect(it0.actionId).toBe('abrazo')
    expect(it0.valencia).toBe(1)
  })

  it('aprecio del día ⇒ type aprecio', async () => {
    sembrar()
    await montar()
    fireEvent.click(screen.getByText('Quiero darte cariño'))
    fireEvent.click(await screen.findByText('💛 Aprecio del día'))
    fireEvent.change(await screen.findByPlaceholderText(/Algo chiquito cuenta/), {
      target: { value: 'me hizo reír' },
    })
    fireEvent.click(screen.getByText('Enviar aprecio 💛'))

    await waitFor(() => expect(interacciones().length).toBe(1))
    const it0 = interacciones()[0]
    expect(it0.type).toBe('aprecio')
    expect(it0.note).toBe('me hizo reír')
    expect(it0.valencia).toBe(1)
  })
})
