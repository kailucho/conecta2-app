// @vitest-environment jsdom
// ============================================================
// Prueba de humo: monta la app completa con un perfil sembrado y verifica que
// las 5 pantallas rendericen sin errores de runtime, para ambos roles.
// ============================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { ProveedorApp } from './contexto/AppContexto.jsx'
import { ProveedorAuth } from './contexto/AuthContexto.jsx'
import App from './App.jsx'
import { claveDia } from './motor/fechas.js'

// Polyfill mínimo de matchMedia (jsdom no lo trae).
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

function sembrarPerfil(rol) {
  const userId = 'u-test'
  localStorage.setItem(
    'mp:perfil',
    JSON.stringify({
      userId,
      coupleId: 'c-test',
      partnerId: 'p-test',
      estadoVinculacion: 'vinculada',
      rol,
      tipoRelacion: 'conviven',
      nombre: 'Test',
      tonoHumor: 'normal',
      privacidadHormonal: 'todo',
      nubarronDebil: null,
      creadoEl: new Date().toISOString(),
    }),
  )
  localStorage.setItem(
    'mp:ciclo',
    JSON.stringify({
      duracionCiclo: 28,
      duracionRegla: 5,
      registrosRegla: [{ id: 'r1', fechaInicio: claveDia(new Date()), registradoPor: userId }],
      promedioReal: 28,
      variabilidad: 0,
      confiable: true,
      modoFertilidad: 'todavia_no',
      etapaVida: 'regular',
      sintomasMenopausia: [],
    }),
  )
}

async function montar() {
  render(
    <ProveedorAuth>
      <ProveedorApp>
        <App />
      </ProveedorApp>
    </ProveedorAuth>,
  )
  // Espera a que termine la hidratación (desaparece el splash).
  await waitFor(() => expect(screen.queryByText('Más')).toBeTruthy())
}

describe('Prueba de humo de la app', () => {
  it('muestra el onboarding cuando no hay perfil', async () => {
    render(
      <ProveedorApp>
        <App />
      </ProveedorApp>,
    )
    await waitFor(() => expect(screen.getByText('Conecta2')).toBeTruthy())
    expect(screen.getByText('Empezar')).toBeTruthy()
  })

  for (const rol of ['ella', 'el']) {
    it(`renderiza las 4 pestañas + Guía sin crashear (rol: ${rol})`, async () => {
      sembrarPerfil(rol)
      await montar()

      // Pestaña Hoy visible por defecto: barra de comunicación presente.
      expect(screen.getByText(/Dile algo a tu amor/)).toBeTruthy()

      // Navega por cada pestaña y verifica un elemento clave.
      fireEvent.click(screen.getByLabelText('Mes'))
      await waitFor(() => expect(screen.getByText(/Modo de fertilidad/)).toBeTruthy())

      fireEvent.click(screen.getByLabelText('Nosotros'))
      await waitFor(() => expect(screen.getByText(/Termómetro de conexión/)).toBeTruthy())

      fireEvent.click(screen.getByLabelText('Más'))
      await waitFor(() => expect(screen.getByText(/Datos y patrones/)).toBeTruthy())

      // La Guía se abre desde "Más".
      fireEvent.click(screen.getByText(/Guía de la relación/))
      await waitFor(() => expect(screen.getByText(/Las 4 fases del ciclo/)).toBeTruthy())
    })
  }

  it('sin pareja explica el bloqueo y lleva a la sección de vinculación', async () => {
    sembrarPerfil('ella')
    const perfil = JSON.parse(localStorage.getItem('mp:perfil'))
    localStorage.setItem('mp:perfil', JSON.stringify({
      ...perfil,
      coupleId: null,
      partnerId: null,
      estadoVinculacion: 'no_vinculada',
    }))
    await montar()

    fireEvent.click(screen.getByText('Vincula a tu pareja para interactuar'))
    await screen.findByText('Vincula a tu pareja para enviarle esto')
    fireEvent.click(screen.getByText('Ir a vinculación'))

    await screen.findByText('Pareja aún no vinculada')
    expect(document.activeElement?.getAttribute('aria-labelledby')).toBe('titulo-vinculacion')
    expect(JSON.parse(localStorage.getItem('mp:interacciones') || '[]')).toEqual([])
  })
})
