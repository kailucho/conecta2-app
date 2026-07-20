// @vitest-environment jsdom
// La barra envía una reacción rápida con un toque, sin duplicar por doble toque.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { ProveedorApp, usarApp } from '../../contexto/AppContexto.jsx'
import BarraComunicacion from './BarraComunicacion.jsx'

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

function Harness({ alAbrirMensaje }) {
  const { cargando } = usarApp()
  if (cargando) return null
  return (
    <BarraComunicacion
      alAbrirCentro={() => {}}
      alAbrirMensaje={alAbrirMensaje}
      onReaccion={() => {}}
    />
  )
}

async function montar(props = {}) {
  render(
    <ProveedorApp>
      <Harness {...props} />
    </ProveedorApp>,
  )
  await waitFor(() => expect(screen.getByText(/Dile algo a tu amor/)).toBeTruthy())
}

function interacciones() {
  return JSON.parse(localStorage.getItem('mp:interacciones') || '[]')
}

describe('BarraComunicacion', () => {
  it('un toque en 💗 envía una reacción rápida (corazon)', async () => {
    sembrar()
    await montar()
    const heart = screen.getByLabelText('Enviar una reacción rápida')
    fireEvent.pointerDown(heart)
    fireEvent.pointerUp(heart)

    await waitFor(() => expect(interacciones().length).toBe(1))
    expect(interacciones()[0].actionId).toBe('corazon')
    expect(interacciones()[0].valencia).toBe(1)
  })

  it('doble toque inmediato no duplica el envío (anti-doble)', async () => {
    sembrar()
    await montar()
    const heart = screen.getByLabelText('Enviar una reacción rápida')
    fireEvent.pointerDown(heart)
    fireEvent.pointerUp(heart)
    fireEvent.pointerDown(heart)
    fireEvent.pointerUp(heart)

    await waitFor(() => expect(interacciones().length).toBe(1))
  })

  it('el área central abre el compositor de mensaje', async () => {
    const alAbrirMensaje = vi.fn()
    sembrar()
    await montar({ alAbrirMensaje })
    fireEvent.click(screen.getByText(/Dile algo a tu amor/))
    expect(alAbrirMensaje).toHaveBeenCalled()
  })
})
