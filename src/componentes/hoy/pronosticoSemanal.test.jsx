// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import PronosticoSemanal from './PronosticoSemanal.jsx'

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
})

function ctxBase() {
  return {
    ciclo: { duracionCiclo: 28, duracionRegla: 5, confiable: true },
    fechaUltimaRegla: '2026-07-01',
    interacciones: [],
    userId: 'u1',
    partnerId: 'u2',
    privacidadHormonal: 'todo',
  }
}

describe('PronosticoSemanal', () => {
  it('muestra 7 días como lista accesible', () => {
    render(<PronosticoSemanal ctx={ctxBase()} whatsappPareja="" />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(7)
  })

  it('al tocar un día abre el detalle accesible (dialog)', () => {
    render(<PronosticoSemanal ctx={ctxBase()} whatsappPareja="" />)
    const items = screen.getAllByRole('listitem')
    fireEvent.click(items[1])
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('el detalle ofrece preparar un mensaje de WhatsApp', async () => {
    window.open = vi.fn(() => ({}))
    render(<PronosticoSemanal ctx={ctxBase()} whatsappPareja="" />)
    fireEvent.click(screen.getAllByRole('listitem')[0])
    fireEvent.click(screen.getByText(/Preparar mensaje para WhatsApp/))
    expect(window.open).toHaveBeenCalled()
  })

  it('es navegable con teclado (botones enfocables)', () => {
    render(<PronosticoSemanal ctx={ctxBase()} whatsappPareja="" />)
    const items = screen.getAllByRole('listitem')
    items[0].focus()
    expect(document.activeElement).toBe(items[0])
  })

  it('empieza en el día de hoy y avanza en orden (sin desfase de huso horario)', () => {
    // 2026-07-21 es martes. En husos negativos (ej. America/Lima, UTC-5),
    // parsear la fecha con `new Date(str)` la interpreta como UTC y corre el
    // día de la semana un día hacia atrás — este test cubre esa regresión.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T15:00:00')) // hora local, martes
    render(<PronosticoSemanal ctx={ctxBase()} whatsappPareja="" />)
    const items = screen.getAllByRole('listitem')
    expect(items[0].getAttribute('aria-label')).toMatch(/^Hoy:/)
    expect(items[1].getAttribute('aria-label')).toMatch(/^Mié:/)
    vi.useRealTimers()
  })
})
