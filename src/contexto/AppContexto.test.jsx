// @vitest-environment jsdom
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProveedorApp, usarApp } from './AppContexto.jsx'
import { usarEnvioInteraccion } from '../componentes/comunicacion/usarEnvioInteraccion.js'
import ParejaRequerida from '../componentes/vinculacion/ParejaRequerida.jsx'

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

function sembrarPerfil(estadoVinculacion = 'no_vinculada') {
  localStorage.setItem('mp:perfil', JSON.stringify({
    userId: 'u1',
    coupleId: estadoVinculacion === 'vinculada' ? 'c1' : null,
    partnerId: estadoVinculacion === 'vinculada' ? 'u2' : null,
    estadoVinculacion,
    rol: 'ella',
    tipoRelacion: 'conviven',
  }))
}

const ACCION = {
  id: 'abrazo',
  categoria: 'gesture',
  notif: 'Necesita un abrazo',
}

function HarnessGuard() {
  const {
    cargando,
    solicitudVinculacion,
    errorInteraccion,
    cerrarSolicitudVinculacion,
    limpiarErrorInteraccion,
    enviarInteraccionPareja,
  } = usarApp()
  const enviarAccion = usarEnvioInteraccion()
  const [resultado, setResultado] = useState(null)
  if (cargando) return null
  return (
    <>
      <button onClick={async () => setResultado(await enviarAccion(ACCION))}>
        Enviar abrazo
      </button>
      <button onClick={async () => setResultado(await enviarInteraccionPareja({ type: 'mensaje' }))}>
        Enviar directo
      </button>
      {resultado && <output>{resultado.ok ? 'ok' : resultado.motivo}</output>}
      <ParejaRequerida
        abierto={!!solicitudVinculacion || !!errorInteraccion}
        motivo={errorInteraccion || 'sin_pareja_vinculada'}
        alCerrar={() => {
          cerrarSolicitudVinculacion()
          limpiarErrorInteraccion()
        }}
        alIrAVinculacion={() => {}}
      />
    </>
  )
}

async function montar() {
  render(<ProveedorApp><HarnessGuard /></ProveedorApp>)
  await screen.findByText('Enviar abrazo')
}

describe('guard central de interacciones de pareja', () => {
  it('sin pareja no guarda, no encola, no da puntos y abre la explicación', async () => {
    sembrarPerfil()
    await montar()
    fireEvent.click(screen.getByText('Enviar abrazo'))

    await screen.findByText('Vincula a tu pareja para enviarle esto')
    expect(screen.getByText('sin_pareja_vinculada')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('mp:interacciones') || '[]')).toEqual([])
    expect(JSON.parse(localStorage.getItem('mp:colaSalida') || '[]')).toEqual([])
    expect(JSON.parse(localStorage.getItem('mp:gamificacion') || '{"puntos":0}').puntos).toBe(0)
  })

  it('con perfil explícitamente vinculado guarda y encola', async () => {
    sembrarPerfil('vinculada')
    await montar()
    fireEvent.click(screen.getByText('Enviar abrazo'))

    await waitFor(() => expect(screen.getByText('ok')).toBeTruthy())
    const interacciones = JSON.parse(localStorage.getItem('mp:interacciones'))
    const cola = JSON.parse(localStorage.getItem('mp:colaSalida'))
    expect(interacciones).toHaveLength(1)
    expect(interacciones[0]).toEqual(expect.objectContaining({
      coupleId: 'c1', senderId: 'u1', receiverId: 'u2', actionId: 'abrazo',
    }))
    expect(cola).toEqual([interacciones[0].id])
  })

  it('diferencia un fallo de persistencia y nunca muestra éxito', async () => {
    sembrarPerfil('vinculada')
    await montar()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('sin espacio')
    })
    fireEvent.click(screen.getByText('Enviar directo'))

    await screen.findByText('No pudimos guardar la interacción')
    expect(screen.getByText('error_persistencia')).toBeTruthy()
    expect(screen.queryByText('ok')).toBeNull()
  })
})
