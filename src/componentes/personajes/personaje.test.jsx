// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { ProveedorApp } from '../../contexto/AppContexto.jsx'
import Personaje from './Personaje.jsx'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

async function montar(props) {
  render(
    <ProveedorApp>
      <Personaje {...props} />
    </ProveedorApp>,
  )
  await screen.findByRole('img')
}

describe('Personaje', () => {
  it('cae al SVG (fallback) cuando la imagen falla al cargar', async () => {
    await montar({ rol: 'el', expresion: 'feliz', tamano: 100 })
    const img = document.querySelector('img[alt="Astro Azul, tranquilo y feliz"]')
    expect(img).toBeTruthy()
    fireEvent.error(img)
    // Tras el error, el SVG (con su propio aria-label) debe quedar visible.
    expect(await screen.findByLabelText('Astro Azul')).toBeTruthy()
  })

  it('la imagen incluye texto alternativo mientras se intenta cargar', async () => {
    await montar({ rol: 'ella', expresion: 'feliz', tamano: 100 })
    const img = document.querySelector('img[alt="Estrellita, tranquila y feliz"]')
    expect(img).toBeTruthy()
    expect(img.getAttribute('alt')).toBe('Estrellita, tranquila y feliz')
  })

  it('respeta reducir movimiento (no anima) en el fallback SVG', async () => {
    localStorage.setItem('mp:config', JSON.stringify({ reducirMovimiento: true }))
    render(
      <ProveedorApp>
        <Personaje rol="el" expresion="feliz" tamano={100} />
      </ProveedorApp>,
    )
    const img = await screen.findByAltText('Astro Azul, tranquilo y feliz')
    fireEvent.error(img)
    expect(await screen.findByLabelText('Astro Azul')).toBeTruthy()
  })
})
