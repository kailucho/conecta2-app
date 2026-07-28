// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ProveedorApp, usarApp } from '../../contexto/AppContexto.jsx'
import TarjetaParaHoy from './TarjetaParaHoy.jsx'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function sembrarPerfil() {
  localStorage.setItem('mp:perfil', JSON.stringify({
    userId: 'u1',
    coupleId: null,
    partnerId: null,
    estadoVinculacion: 'no_vinculada',
    rol: 'el',
    tipoRelacion: 'conviven',
    tonoHumor: 'normal',
    privacidadHormonal: 'todo',
  }))
}

function Harness(props) {
  const { cargando } = usarApp()
  if (cargando) return null
  return <TarjetaParaHoy {...props} onReaccion={() => {}} />
}

async function montar(props) {
  render(
    <ProveedorApp>
      <Harness {...props} />
    </ProveedorApp>,
  )
}

describe('TarjetaParaHoy', () => {
  it('el tip del día siempre ofrece "Enviar por WhatsApp" (la tarjeta nunca se queda sin acción)', async () => {
    sembrarPerfil()
    // semilla=1 con fase presente cae en 'tip' según ROTACION_CON_FASE.
    await montar({ semilla: 1, faseId: 'folicular', hayDatos: true })
    await screen.findByText(/Tip del día/i)
    expect(screen.queryByText(/Enviar por WhatsApp/i)).toBeTruthy()
  })

  it('la misión no muestra el botón de enviar (usa "Marcar como hecha")', async () => {
    sembrarPerfil()
    // semilla=0 cae en 'mision' según ROTACION_CON_FASE.
    await montar({ semilla: 0, faseId: 'folicular', hayDatos: true })
    await screen.findByText(/Marcar como hecha/i)
    expect(screen.queryByText(/Enviar por WhatsApp/i)).toBeNull()
  })
})
