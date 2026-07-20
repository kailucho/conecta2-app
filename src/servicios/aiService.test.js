// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const estadoMock = { configurado: true }

vi.mock('./supabaseClient.js', () => ({
  get supabaseConfigurado() {
    return estadoMock.configurado
  },
  supabase: {
    functions: { invoke: vi.fn() },
  },
}))

import { supabase } from './supabaseClient.js'
import { CLAVES, guardar } from './storageService.js'
import { askAI } from './aiService.js'

beforeEach(() => {
  localStorage.clear()
  estadoMock.configurado = true
  vi.clearAllMocks()
})
afterEach(() => localStorage.clear())

describe('askAI', () => {
  it('usa el fallback estático si la IA está desactivada, sin llamar a la Edge Function', async () => {
    await guardar(CLAVES.config, { iaActiva: false })
    const r = await askAI('traductor', { mensajeUsuario: 'haz lo que quieras', rolPareja: 'ella' })
    expect(r.fuente).toBe('fallback')
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })

  it('usa el fallback si Supabase no está configurado', async () => {
    estadoMock.configurado = false
    await guardar(CLAVES.config, { iaActiva: true })
    const r = await askAI('mensaje_carinoso', { fase: 'folicular' })
    expect(r.fuente).toBe('fallback')
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })

  it('rechaza tareas no soportadas sin llamar a la red', async () => {
    await guardar(CLAVES.config, { iaActiva: true })
    const r = await askAI('tarea_inventada', {})
    expect(r.fuente).toBe('fallback')
    expect(supabase.functions.invoke).not.toHaveBeenCalled()
  })

  it('devuelve fuente "ia" cuando la Edge Function responde texto', async () => {
    await guardar(CLAVES.config, { iaActiva: true })
    supabase.functions.invoke.mockResolvedValue({ data: { texto: 'Respuesta de la IA' }, error: null })
    const r = await askAI('sos_chat', { mensajeUsuario: 'discutimos', escenario: 'general', tono: 'normal' })
    expect(r).toEqual({ texto: 'Respuesta de la IA', fuente: 'ia' })
    expect(supabase.functions.invoke).toHaveBeenCalledWith('ai', expect.objectContaining({
      body: { tarea: 'sos_chat', contexto: expect.objectContaining({ mensajeUsuario: 'discutimos' }) },
    }))
  })

  it('cae al fallback si la Edge Function devuelve error', async () => {
    await guardar(CLAVES.config, { iaActiva: true })
    supabase.functions.invoke.mockResolvedValue({ data: null, error: { message: 'no_autenticado' } })
    const r = await askAI('insights', { datos: {} })
    expect(r.fuente).toBe('fallback')
  })

  it('cae al fallback si la Edge Function no devuelve texto', async () => {
    await guardar(CLAVES.config, { iaActiva: true })
    supabase.functions.invoke.mockResolvedValue({ data: {}, error: null })
    const r = await askAI('reformulador', { mensajeUsuario: 'siempre haces lo mismo' })
    expect(r.fuente).toBe('fallback')
  })

  it('incrementa el contador de uso de IA en cada llamada, tenga o no éxito', async () => {
    await guardar(CLAVES.config, { iaActiva: false, contadorUsoIA: 2 })
    await askAI('traductor', { mensajeUsuario: 'ok' })
    const config = await import('./storageService.js').then((m) => m.obtener(CLAVES.config, {}))
    expect(config.contadorUsoIA).toBe(3)
  })
})
