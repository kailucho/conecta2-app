// @vitest-environment jsdom
// Accesibilidad de ModalHoja: role dialog, Escape, bloqueo de scroll y foco.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ModalHoja from './ModalHoja.jsx'

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
})

describe('ModalHoja', () => {
  it('no renderiza nada cuando está cerrado', () => {
    const { container } = render(
      <ModalHoja abierto={false} alCerrar={() => {}} titulo="Hola">
        <p>contenido</p>
      </ModalHoja>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('expone role="dialog" y aria-modal cuando está abierto', () => {
    render(
      <ModalHoja abierto alCerrar={() => {}} titulo="Título de prueba">
        <p>contenido</p>
      </ModalHoja>,
    )
    const dialogo = screen.getByRole('dialog')
    expect(dialogo.getAttribute('aria-modal')).toBe('true')
    // aria-labelledby apunta al título.
    const idTitulo = dialogo.getAttribute('aria-labelledby')
    expect(idTitulo).toBeTruthy()
    expect(document.getElementById(idTitulo).textContent).toBe('Título de prueba')
  })

  it('bloquea el scroll del fondo mientras está abierto y lo restaura al cerrar', () => {
    const { rerender } = render(
      <ModalHoja abierto alCerrar={() => {}} titulo="X">
        <p>contenido</p>
      </ModalHoja>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    rerender(
      <ModalHoja abierto={false} alCerrar={() => {}} titulo="X">
        <p>contenido</p>
      </ModalHoja>,
    )
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('cierra con la tecla Escape', () => {
    const alCerrar = vi.fn()
    render(
      <ModalHoja abierto alCerrar={alCerrar} titulo="X">
        <p>contenido</p>
      </ModalHoja>,
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(alCerrar).toHaveBeenCalled()
  })

  it('cierra al hacer click en el botón de cerrar', () => {
    const alCerrar = vi.fn()
    render(
      <ModalHoja abierto alCerrar={alCerrar} titulo="X">
        <p>contenido</p>
      </ModalHoja>,
    )
    fireEvent.click(screen.getByLabelText('Cerrar'))
    expect(alCerrar).toHaveBeenCalled()
  })

  it('devuelve el foco al disparador al cerrar', () => {
    const disparador = document.createElement('button')
    disparador.textContent = 'abrir'
    document.body.appendChild(disparador)
    disparador.focus()
    expect(document.activeElement).toBe(disparador)

    const { rerender } = render(
      <ModalHoja abierto alCerrar={() => {}} titulo="X">
        <button>dentro</button>
      </ModalHoja>,
    )
    rerender(
      <ModalHoja abierto={false} alCerrar={() => {}} titulo="X">
        <button>dentro</button>
      </ModalHoja>,
    )
    expect(document.activeElement).toBe(disparador)
    disparador.remove()
  })
})
