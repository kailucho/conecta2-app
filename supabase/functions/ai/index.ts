// ============================================================
// Edge Function "ai" — proxy seguro hacia Anthropic.
//
// Reemplaza la llamada directa que hacía el navegador (que exponía
// VITE_ANTHROPIC_API_KEY en el bundle). Ahora la clave vive SOLO en los
// secretos del servidor (ANTHROPIC_API_KEY) y nunca llega al cliente.
//
// Contrato con el frontend (src/servicios/aiService.js):
//   POST /functions/v1/ai   { tarea: string, contexto: object }
//   -> 200 { texto: string }
// Cualquier error se responde con un motivo genérico (nunca el detalle
// interno) para que el cliente pueda degradar al fallback estático.
// ============================================================

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODELO = 'claude-haiku-4-5'
const TIMEOUT_MS = 10000
const MAX_LARGO_MENSAJE = 4000

// Debe reflejar exactamente las claves de SISTEMA en src/servicios/aiService.js.
const SISTEMA: Record<string, string> = {
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

const CABECERAS_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function construirPrompt(tarea: string, ctx: Record<string, any>) {
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
      return String(ctx.mensajeUsuario || '')
  }
}

function respuestaError(motivo: string, status = 400) {
  return new Response(JSON.stringify({ error: motivo }), {
    status,
    headers: { ...CABECERAS_CORS, 'content-type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CABECERAS_CORS })
  }
  if (req.method !== 'POST') {
    return respuestaError('metodo_no_permitido', 405)
  }

  // Valida el JWT del usuario autenticado (Supabase ya lo verifica al crear
  // el cliente con el header Authorization reenviado por supabase-js).
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return respuestaError('no_autenticado', 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseAnonKey) return respuestaError('error_configuracion', 500)

  const clienteUsuario = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: errorUsuario } = await clienteUsuario.auth.getUser()
  if (errorUsuario || !userData?.user) return respuestaError('no_autenticado', 401)

  let body: any
  try {
    body = await req.json()
  } catch {
    return respuestaError('body_invalido')
  }

  const tarea = body?.tarea
  const contexto = body?.contexto || {}

  if (typeof tarea !== 'string' || !SISTEMA[tarea]) {
    return respuestaError('tarea_no_permitida')
  }
  if (typeof contexto !== 'object' || contexto === null) {
    return respuestaError('contexto_invalido')
  }
  const mensaje = String(contexto.mensajeUsuario || '')
  if (mensaje.length > MAX_LARGO_MENSAJE) {
    return respuestaError('mensaje_demasiado_largo')
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) return respuestaError('ia_no_configurada', 503)

  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    const resp = await fetch(API_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 500,
        system: SISTEMA[tarea],
        messages: [{ role: 'user', content: construirPrompt(tarea, contexto) }],
      }),
    })
    clearTimeout(t)
    if (!resp.ok) throw new Error(`anthropic_http_${resp.status}`)
    const data = await resp.json()
    const texto = data?.content?.[0]?.text?.trim()
    if (!texto) throw new Error('respuesta_vacia')

    return new Response(JSON.stringify({ texto }), {
      status: 200,
      headers: { ...CABECERAS_CORS, 'content-type': 'application/json' },
    })
  } catch (e) {
    // Nunca se expone el detalle interno (mensaje de Anthropic, stack, etc.)
    console.error('[ai edge function] fallo al llamar a Anthropic:', e)
    return respuestaError('error_inesperado', 502)
  }
})
