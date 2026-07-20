// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { ProveedorApp } from '../../contexto/AppContexto.jsx'
import ConfirmacionRespuesta from './ConfirmacionRespuesta.jsx'

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

function sembrar(interacciones, extra = {}) {
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
  localStorage.setItem('mp:interacciones', JSON.stringify(interacciones))
  if (extra.vistas) localStorage.setItem('mp:confirmacionesVistas', JSON.stringify(extra.vistas))
}

function enviadaYReconocida(extra) {
  return {
    id: 'i-1',
    createdAt: new Date().toISOString(),
    respondedAt: new Date().toISOString(),
    status: 'acknowledged',
    coupleId: 'c',
    senderId: 'u-me',
    receiverId: 'u-other',
    respuestaTexto: 'Gracias',
    ...extra,
  }
}

async function montar() {
  render(
    <ProveedorApp>
      <ConfirmacionRespuesta />
    </ProveedorApp>,
  )
}

describe('ConfirmacionRespuesta', () => {
  it('muestra la respuesta de la pareja a algo que YO envié', async () => {
    sembrar([enviadaYReconocida()])
    await montar()
    await waitFor(() => expect(screen.getByText(/Gracias/)).toBeTruthy())
  })

  it('no muestra nada si la interacción es algo que recibí (no que envié)', async () => {
    sembrar([enviadaYReconocida({ senderId: 'u-other', receiverId: 'u-me' })])
    await montar()
    await waitFor(() => expect(document.body.textContent).not.toMatch(/Gracias/))
  })

  it('no muestra nada si aún no fue reconocida', async () => {
    sembrar([enviadaYReconocida({ status: 'pendiente_sync', respuestaTexto: null })])
    await montar()
    await waitFor(() => expect(document.body.textContent).not.toMatch(/Gracias/))
  })

  it('al descartar, no vuelve a aparecer aunque se recargue', async () => {
    sembrar([enviadaYReconocida()])
    await montar()
    await waitFor(() => expect(screen.getByText(/Gracias/)).toBeTruthy())

    fireEvent.click(screen.getByLabelText('Descartar'))
    await waitFor(() => expect(screen.queryByText(/Gracias/)).toBeNull())

    cleanup()
    await montar()
    await waitFor(() => expect(screen.queryByText(/Gracias/)).toBeNull())
  })

  it('respeta confirmaciones ya vistas al cargar de localStorage', async () => {
    sembrar([enviadaYReconocida()], { vistas: ['i-1'] })
    await montar()
    await waitFor(() => expect(document.body.textContent).not.toMatch(/Gracias/))
  })
})
