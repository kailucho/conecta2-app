// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FechaDiaMesAnio from './FechaDiaMesAnio.jsx'

afterEach(cleanup)

describe('FechaDiaMesAnio', () => {
  it('renderiza Día, Mes y Año en ese orden', () => {
    const { container } = render(<FechaDiaMesAnio onChange={() => {}} />)
    expect([...container.querySelectorAll('label')].map((label) => label.textContent)).toEqual([
      'Día',
      'Mes',
      'Año',
    ])
  })

  it('carga 2026-07-19 en los controles correctos', () => {
    render(<FechaDiaMesAnio value="2026-07-19" max="2026-12-31" onChange={() => {}} />)
    expect(screen.getByLabelText('Día').value).toBe('19')
    expect(screen.getByLabelText('Mes').value).toBe('07')
    expect(screen.getByLabelText('Año').value).toBe('2026')
  })

  it('muestra primero los años recientes en un selector', () => {
    render(<FechaDiaMesAnio max="2026-07-20" onChange={() => {}} />)
    const opciones = [...screen.getByLabelText('Año').options].map((opcion) => opcion.value)
    expect(opciones.slice(0, 4)).toEqual(['', '2026', '2025', '2024'])
    expect(opciones.at(-1)).toBe('otro')
  })

  it('permite escribir un año antiguo que no aparece en la lista', () => {
    const onChange = vi.fn()
    render(<FechaDiaMesAnio max="2026-07-20" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '19' } })
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '07' } })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: 'otro' } })
    fireEvent.change(screen.getByLabelText('Escribe el año'), { target: { value: '1998' } })
    expect(onChange).toHaveBeenLastCalledWith(
      '1998-07-19',
      expect.objectContaining({ estado: 'valida' }),
    )
  })

  it('convierte 19, julio y 2026 al ISO 2026-07-19', () => {
    const onChange = vi.fn()
    render(<FechaDiaMesAnio onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '19' } })
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '07' } })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2026' } })
    expect(onChange).toHaveBeenLastCalledWith(
      '2026-07-19',
      expect.objectContaining({ estado: 'valida' }),
    )
  })

  it('marca 31 de febrero como inválida', () => {
    const onChange = vi.fn()
    render(<FechaDiaMesAnio onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '31' } })
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '02' } })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2026' } })
    expect(onChange).toHaveBeenLastCalledWith(
      '',
      expect.objectContaining({ estado: 'invalida' }),
    )
  })

  it('marca como futura una fecha posterior al máximo controlado', () => {
    const onChange = vi.fn()
    render(<FechaDiaMesAnio max="2026-07-20" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '21' } })
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '07' } })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2026' } })
    expect(onChange).toHaveBeenLastCalledWith(
      '2026-07-21',
      expect.objectContaining({ estado: 'futura' }),
    )
  })

  it('asocia el error visible y aria-invalid a los controles', () => {
    render(<FechaDiaMesAnio error="Ingresa una fecha válida." onChange={() => {}} />)
    expect(screen.getByRole('alert').textContent).toContain('Ingresa una fecha válida.')
    expect(screen.getByLabelText('Día').getAttribute('aria-invalid')).toBe('true')
  })
})
