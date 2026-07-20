// ============================================================
// aiService — capa de IA con DEGRADACIÓN ELEGANTE.
//
// Cada función tiene un fallback estático. Si la IA está apagada, Supabase
// no está configurado, o la llamada falla/expira, se usa el fallback
// automáticamente. Así la app funciona 100% offline y sin costo.
//
// La llamada real ocurre en la Edge Function `ai` (supabase/functions/ai) —
// la API key de Anthropic vive SOLO en los secretos del servidor y nunca en
// el bundle del navegador. Modelo: claude-haiku (bajo costo).
// ============================================================

import { obtener, guardar, CLAVES } from './storageService.js'
import { supabase, supabaseConfigurado } from './supabaseClient.js'
import { detectarNubarronEstatico, NUBARRONES } from '../datos/nubarrones.js'
import { traducirEstatico } from '../datos/diccionario.js'
import { contenidoFase } from '../datos/tiposFase.js'
import { escenarioPorId } from '../datos/protocolosSOS.js'

const TIMEOUT_MS = 10000

// Tareas soportadas. Deben coincidir exactamente con las claves SISTEMA de
// supabase/functions/ai/index.ts (el prompt del sistema ahora vive ahí,
// server-side, junto con la API key).
const TAREAS_VALIDAS = new Set([
  'sos_chat',
  'mensaje_carinoso',
  'traductor',
  'insights',
  'reformulador',
])

/**
 * Punto de entrada único. Intenta la Edge Function de IA; si no, cae al
 * fallback estático. Nunca lanza: siempre devuelve { texto, fuente }.
 * @param {string} tarea   una de TAREAS_VALIDAS
 * @param {object} contexto datos + `mensajeUsuario`
 */
export async function askAI(tarea, contexto = {}) {
  const config = await obtener(CLAVES.config, {})
  await incrementarUso()

  // Condiciones para usar el fallback directamente, sin llamar a la red.
  if (!config.iaActiva || !supabaseConfigurado || !TAREAS_VALIDAS.has(tarea)) {
    return { texto: fallback(tarea, contexto), fuente: 'fallback' }
  }

  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    const { data, error } = await supabase.functions.invoke('ai', {
      body: { tarea, contexto },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (error) throw error
    const texto = data?.texto?.trim?.()
    if (!texto) throw new Error('Respuesta vacía')
    return { texto, fuente: 'ia' }
  } catch (e) {
    // Degradación elegante: cualquier fallo (sin conexión, JWT inválido,
    // rate limit, timeout, IA sin configurar en el servidor) cae al fallback.
    console.warn('[aiService] Falló la IA, usando fallback:', e?.message || e)
    return { texto: fallback(tarea, contexto), fuente: 'fallback' }
  }
}

// ---------- Fallbacks estáticos por tarea ----------
function fallback(tarea, ctx) {
  switch (tarea) {
    case 'sos_chat': {
      const nb = detectarNubarronEstatico(ctx.mensajeUsuario || '')
      const esc = escenarioPorId(ctx.escenario)
      let out = ''
      if (nb) {
        const n = NUBARRONES[nb]
        out += `Ojo: en lo que cuentas aparece ${n.emoji} ${n.nombre}. ${n.antidoto} Por ejemplo: ${n.antidotoEjemplo}\n\n`
      }
      if (esc) {
        out += `Plan para "${esc.label}":\n` + esc.pasos.map((p, i) => `${i + 1}. ${p}`).join('\n')
      } else {
        out +=
          'Respira, activa la pausa de 20 min si están alterados y retomen con un inicio suave: "me sentí ___ cuando ___, me gustaría ___".'
      }
      return out
    }
    case 'mensaje_carinoso': {
      const c = contenidoFase(ctx.fase || 'folicular')
      const frases = c.frases
      return frases[Math.floor(Math.random() * frases.length)]
    }
    case 'traductor': {
      const t = traducirEstatico(ctx.mensajeUsuario, ctx.rolPareja || 'ella')
      return `Significa: ${t.significa}\n\nCómo responder: ${t.responde}\n\nGravedad: ${t.gravedad}`
    }
    case 'insights':
      return 'Aún estoy juntando datos. Sigue registrando el ánimo unos días y te muestro patrones útiles 💙'
    case 'reformulador':
      return 'Prueba: "Me siento ___ cuando ___, me gustaría ___." Cuenta cómo te sentiste y pide algo concreto, sin "siempre" ni "nunca".'
    default:
      return 'Estoy aquí para ayudarte 💙'
  }
}

async function incrementarUso() {
  const config = await obtener(CLAVES.config, {})
  await guardar(CLAVES.config, {
    ...config,
    contadorUsoIA: (config.contadorUsoIA || 0) + 1,
  })
}
