// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { limpiarTelefono, construirUrl, abrirWhatsApp, debeUsarWhatsApp } from './whatsappService.js'

describe('limpiarTelefono', () => {
  it('quita espacios, guiones, paréntesis y símbolos', () => {
    expect(limpiarTelefono('+51 (999) 888-777')).toBe('+51999888777')
    expect(limpiarTelefono('999.888.777')).toBe('999888777')
  })

  it('devuelve vacío si no hay valor', () => {
    expect(limpiarTelefono('')).toBe('')
    expect(limpiarTelefono(null)).toBe('')
  })
})

describe('construirUrl', () => {
  it('codifica correctamente el mensaje', () => {
    const url = construirUrl({ texto: 'Hola amor 💗' })
    expect(url).toContain(encodeURIComponent('Hola amor 💗'))
  })

  it('abre con número cuando existe', () => {
    const url = construirUrl({ telefono: '+51999888777', texto: 'hola' })
    expect(url).toBe(`https://wa.me/51999888777?text=${encodeURIComponent('hola')}`)
  })

  it('abre sin número cuando no existe (selección de contacto)', () => {
    const url = construirUrl({ texto: 'hola' })
    expect(url).toBe(`https://wa.me/?text=${encodeURIComponent('hola')}`)
  })
})

describe('abrirWhatsApp', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('usa window.open y nunca marca como "enviado" (solo "preparado")', async () => {
    window.open = vi.fn(() => ({}))
    const r = await abrirWhatsApp({ telefono: '999888777', texto: 'hola' })
    expect(r.ok).toBe(true)
    expect(r.canal).toBe('whatsapp')
    expect(r.estado).toBe('preparado')
    expect(r.estado).not.toBe('enviado')
  })

  it('usuario sin vinculación: abre sin número', async () => {
    window.open = vi.fn(() => ({}))
    const r = await abrirWhatsApp({ texto: 'hola' })
    expect(r.ok).toBe(true)
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/?text='), '_blank', 'noopener,noreferrer')
  })

  it('usuario vinculado con número guardado: abre conversación directa', async () => {
    window.open = vi.fn(() => ({}))
    await abrirWhatsApp({ telefono: '+51999888777', texto: 'hola' })
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/51999888777'), '_blank', 'noopener,noreferrer')
  })

  it('fallback a Web Share cuando window.open falla', async () => {
    window.open = vi.fn(() => null)
    navigator.share = vi.fn(() => Promise.resolve())
    const r = await abrirWhatsApp({ texto: 'hola' })
    expect(r.canal).toBe('compartir')
    expect(r.estado).toBe('preparado')
  })

  it('fallback a copiar cuando no hay window.open ni share', async () => {
    window.open = vi.fn(() => null)
    delete navigator.share
    navigator.clipboard = { writeText: vi.fn(() => Promise.resolve()) }
    const r = await abrirWhatsApp({ texto: 'hola' })
    expect(r.canal).toBe('copiado')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hola')
  })
})

describe('debeUsarWhatsApp', () => {
  const vinculado = { userId: 'u1', coupleId: 'c1', partnerId: 'u2', estadoVinculacion: 'vinculada' }
  const sinVinculo = { userId: 'u1', coupleId: null, partnerId: null, estadoVinculacion: 'no_vinculada' }

  it('sin pareja vinculada siempre usa WhatsApp, sin importar el canal configurado', () => {
    expect(debeUsarWhatsApp(sinVinculo, { canalPredeterminado: 'conecta2' })).toBe(true)
    expect(debeUsarWhatsApp(sinVinculo, { canalPredeterminado: 'whatsapp' })).toBe(true)
  })

  it('con pareja vinculada y canal predeterminado "whatsapp", usa WhatsApp igual', () => {
    expect(debeUsarWhatsApp(vinculado, { canalPredeterminado: 'whatsapp' })).toBe(true)
  })

  it('con pareja vinculada y canal predeterminado "conecta2", usa el canal interno', () => {
    expect(debeUsarWhatsApp(vinculado, { canalPredeterminado: 'conecta2' })).toBe(false)
  })
})
