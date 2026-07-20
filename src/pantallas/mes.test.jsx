// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ProveedorApp, usarApp } from '../contexto/AppContexto.jsx'
import Mes from './Mes.jsx'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('mp:perfil', JSON.stringify({
    userId: 'u1',
    coupleId: null,
    partnerId: null,
    estadoVinculacion: 'no_vinculada',
    rol: 'ella',
    tipoRelacion: 'conviven',
    privacidadHormonal: 'todo',
  }))
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function Harness() {
  const { cargando } = usarApp()
  return cargando ? null : <Mes />
}

describe('registro manual desde Mes', () => {
  it('rechaza una fecha imposible y permite corregir conservando el id', async () => {
    render(<ProveedorApp><Harness /></ProveedorApp>)
    await screen.findByText('Ingresa el primer día de la última menstruación')

    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '31' } })
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '02' } })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2024' } })
    fireEvent.click(screen.getByText('Guardar primer día'))
    expect(await screen.findByText('Ingresa una fecha válida.')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '29' } })
    fireEvent.click(screen.getByText('Guardar primer día'))
    await waitFor(() => {
      const ciclo = JSON.parse(localStorage.getItem('mp:ciclo'))
      expect(ciclo.registrosRegla[0].fechaInicio).toBe('2024-02-29')
    })
    const idOriginal = JSON.parse(localStorage.getItem('mp:ciclo')).registrosRegla[0].id

    fireEvent.click(await screen.findByText('Corregir último inicio'))
    fireEvent.change(screen.getByLabelText('Día'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '03' } })
    fireEvent.click(screen.getByText('Revisar corrección'))
    expect(screen.getByText(/reemplazar la fecha/)).toBeTruthy()
    fireEvent.click(screen.getByText('Sí, corregir'))

    await waitFor(() => {
      const registro = JSON.parse(localStorage.getItem('mp:ciclo')).registrosRegla[0]
      expect(registro.id).toBe(idOriginal)
      expect(registro.fechaInicio).toBe('2024-03-01')
      expect(registro.corregidoPor).toBe('u1')
      expect(registro.rolCorreccion).toBe('ella')
    })
  })
})
