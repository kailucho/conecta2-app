// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ProveedorApp, usarApp } from '../../contexto/AppContexto.jsx'
import { ESCENARIOS_SOS } from '../../datos/protocolosSOS.js'
import FlujoSOS from './FlujoSOS.jsx'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('mp:perfil', JSON.stringify({
    userId: 'u1',
    coupleId: null,
    partnerId: null,
    estadoVinculacion: 'no_vinculada',
    rol: 'ella',
    tipoRelacion: 'casados',
  }))
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function Harness() {
  const { cargando } = usarApp()
  if (cargando) return null
  return <FlujoSOS alCerrar={() => {}} />
}

describe('SOS sin pareja vinculada', () => {
  it('abre el protocolo, registra el uso y arranca el temporizador solo local', async () => {
    render(<ProveedorApp><Harness /></ProveedorApp>)
    fireEvent.click(await screen.findByText(ESCENARIOS_SOS[0].label))

    await waitFor(() => {
      const sos = JSON.parse(localStorage.getItem('mp:sos'))
      expect(sos.usos).toHaveLength(1)
      expect(sos.usos[0].escenario).toBe(ESCENARIOS_SOS[0].id)
    })
    expect(screen.getByText(ESCENARIOS_SOS[0].pasos[0])).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('mp:interacciones') || '[]')).toEqual([])

    fireEvent.click(screen.getByText(/Activar pausa de 20 min/))
    await screen.findByText(/La pausa comenzó en este dispositivo/)
    expect(screen.getByText('20:00')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('mp:interacciones') || '[]')).toEqual([])
  })
})
