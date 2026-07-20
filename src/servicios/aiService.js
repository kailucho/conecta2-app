// ============================================================
// aiService — capa de IA con DEGRADACIÓN ELEGANTE.
//
// Cada función tiene un fallback estático. Si la IA está apagada, no hay API
// key, o la llamada falla/expira, se usa el fallback automáticamente. Así la
// app funciona 100% offline y sin costo.
//
// La key vive en la variable de entorno VITE_ANTHROPIC_API_KEY (nunca en el
// código). Modelo: claude-haiku (bajo costo).
// ============================================================

import { obtener, guardar, CLAVES } from './storageService.js'
import { detectarNubarronEstatico, NUBARRONES } from '../datos/nubarrones.js'
import { traducirEstatico } from '../datos/diccionario.js'
import { contenidoFase } from '../datos/tiposFase.js'
import { escenarioPorId } from '../datos/protocolosSOS.js'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODELO = 'claude-haiku-4-5'
const TIMEOUT_MS = 10000

function tieneKey() {
  return !!import.meta.env.VITE_ANTHROPIC_API_KEY
}

// Prompts de sistema por tarea. Todos exigen tono peruano cariñoso y la regla
// de nunca culpar, burlarse ni atribuir todo a las hormonas.
const SISTEMA = {
  sos_chat:
    'Eres un consejero de pareja cálido y práctico, peruano informal. Ayuda a desescalar conflictos con pasos concretos y una disculpa redactada si aplica. Identifica si aparece alguno de los 4 jinetes de Gottman (crítica, desprecio, defensividad, bloqueo) y da su antídoto. Nunca culpes a la pareja ausente ni atribuyas emociones solo a hormonas. Sé breve.',
  mensaje_carinoso:
    'Eres un asistente que escribe mensajes cariñosos y auténticos en español peruano informal, según la fase del ciclo y el contexto. Nada cursi de más, nada burlón. Devuelve solo el mensaje.',
  traductor:
    'Traduces lo que dijo la pareja a lo que probablemente quiso decir, con empatía y humor suave (nunca burlón). Explica el significado, cómo responder y un nivel de gravedad. Español peruano informal.',
  insights:
    'Analizas registros de ánimo y de la relación y das 2-3 observaciones honestas, útiles y con humor suave, en español peruano. Nunca culpes ni atribuyas todo a las hormonas; usa "podría", "coincide con".',
  reformulador:
    'Reformulas una queja agresiva en un inicio suave de Gottman: "Me siento [emoción] cuando [situación específica], me gustaría [pedido]". Español peruano. Devuelve solo la versión reformulada.',
}

/**
 * Punto de entrada único. Intenta IA; si no, cae al fallback.
 * @param {string} tarea   clave de SISTEMA
 * @param {object} contexto datos + `mensajeUsuario`
 */
export async function askAI(tarea, contexto = {}) {
  const config = await obtener(CLAVES.config, {})
  await incrementarUso()

  // Condiciones para usar el fallback directamente.
  if (!config.iaActiva || !tieneKey()) {
    return { texto: fallback(tarea, contexto), fuente: 'fallback' }
  }

  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    const resp = await fetch(API_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 500,
        system: SISTEMA[tarea] || '',
        messages: [
          {
            role: 'user',
            content: construirPrompt(tarea, contexto),
          },
        ],
      }),
    })
    clearTimeout(t)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()
    const texto = data?.content?.[0]?.text?.trim()
    if (!texto) throw new Error('Respuesta vacía')
    return { texto, fuente: 'ia' }
  } catch (e) {
    // Degradación elegante: cualquier fallo cae al fallback.
    console.warn('[aiService] Falló la IA, usando fallback:', e.message)
    return { texto: fallback(tarea, contexto), fuente: 'fallback' }
  }
}

function construirPrompt(tarea, ctx) {
  switch (tarea) {
    case 'sos_chat':
      return `Situación: ${ctx.mensajeUsuario}\nEscenario: ${ctx.escenario || 'general'}\nTono de humor: ${ctx.tono || 'normal'}`
    case 'mensaje_carinoso':
      return `Fase del ciclo: ${ctx.fase || 'desconocida'}\nContexto: ${ctx.mensajeUsuario || 'un mensaje lindo del día'}\nTono: ${ctx.tono || 'normal'}`
    case 'traductor':
      return `La pareja dijo: "${ctx.mensajeUsuario}". Traduce qué quiso decir y cómo responder.`
    case 'insights':
      return `Datos de la semana: ${JSON.stringify(ctx.datos || {})}`
    case 'reformulador':
      return `Queja original: "${ctx.mensajeUsuario}"`
    default:
      return ctx.mensajeUsuario || ''
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
