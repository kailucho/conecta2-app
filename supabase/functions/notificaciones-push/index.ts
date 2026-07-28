// ============================================================
// Edge Function "notificaciones-push" — envío programado del resumen
// matutino (Nivel 3). Pensada para ser invocada periódicamente (cada
// 10-15 minutos) por un scheduler externo (pg_cron o Supabase Scheduled
// Functions — ver docs/push-notifications.md, no se automatiza desde las
// migraciones).
//
// Por cada usuario con notification_preferences.activo = true:
//   1. Calcula la hora local (zona_horaria) y compara con `hora`/`dias`.
//   2. Si ya se envió el resumen de HOY (notification_deliveries), se salta
//      (idempotencia — nunca reenvía el mismo día).
//   3. Envía Web Push a cada push_subscriptions del usuario con VAPID.
//   4. Si una suscripción responde 404/410 (expirada/inválida), se elimina.
//   5. Registra la entrega en notification_deliveries.
//
// El contenido es genérico y NO calcula fase/radar en el servidor (esos
// cálculos son deterministas y viven solo en el cliente); el mensaje remite
// a abrir la app para ver el detalle, evitando duplicar lógica del motor.
//
// Secretos requeridos (Supabase → Project Settings → Edge Functions):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (autoinyectados por Supabase)
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:... o https://...)
// Ninguna clave privada se expone al frontend.
// ============================================================

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import webpush from 'https://esm.sh/web-push@3.6.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:soporte@conecta2.app'

function horaYDiaEnZona(zona: string, ahora: Date) {
  try {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: zona || undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'short',
    }).formatToParts(ahora)
    const h = partes.find((p) => p.type === 'hour')?.value ?? '00'
    const m = partes.find((p) => p.type === 'minute')?.value ?? '00'
    const diaTxt = partes.find((p) => p.type === 'weekday')?.value ?? 'Sun'
    const MAPA: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    return { hora: `${h}:${m}`, diaSemana: MAPA[diaTxt] ?? 0 }
  } catch {
    return { hora: '00:00', diaSemana: ahora.getUTCDay() }
  }
}

function fechaLocalISO(zona: string, ahora: Date) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: zona || undefined }).format(ahora) // AAAA-MM-DD
  } catch {
    return ahora.toISOString().slice(0, 10)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405 })
  }
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: 'vapid_no_configurada' }), { status: 500 })
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  const ahora = new Date()
  const { data: preferencias, error: errPrefs } = await admin
    .from('notification_preferences')
    .select('user_id, hora, dias, zona_horaria, fines_semana, contenido_sensible, silencio')
    .eq('activo', true)

  if (errPrefs) {
    return new Response(JSON.stringify({ error: 'error_leyendo_preferencias' }), { status: 500 })
  }

  let enviados = 0
  let omitidos = 0
  let suscripcionesEliminadas = 0

  for (const pref of preferencias || []) {
    const { hora, diaSemana } = horaYDiaEnZona(pref.zona_horaria, ahora)
    const fechaLocal = fechaLocalISO(pref.zona_horaria, ahora)

    if (Array.isArray(pref.dias) && !pref.dias.includes(diaSemana)) {
      omitidos++
      continue
    }
    if (pref.fines_semana === false && (diaSemana === 0 || diaSemana === 6)) {
      omitidos++
      continue
    }
    if (hora < (pref.hora || '07:00')) {
      omitidos++
      continue
    }

    // Idempotencia: unique(user_id, fecha) — si ya existe, se salta sin error.
    const { error: errInsert } = await admin
      .from('notification_deliveries')
      .insert({ user_id: pref.user_id, fecha: fechaLocal })
    if (errInsert) {
      omitidos++ // ya se envió hoy (o error), no se reintenta en esta corrida
      continue
    }

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth_key')
      .eq('user_id', pref.user_id)

    const titulo = pref.contenido_sensible
      ? 'Tu pronóstico de hoy está listo ☀️'
      : 'Conecta2 tiene listo tu resumen de hoy.'
    const payload = JSON.stringify({ titulo, cuerpo: 'Ábrelo para ver el detalle.', silencio: !!pref.silencio })

    for (const sub of subs || []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload,
        )
        enviados++
      } catch (e: any) {
        const status = e?.statusCode
        if (status === 404 || status === 410) {
          await admin.from('push_subscriptions').delete().eq('id', sub.id)
          suscripcionesEliminadas++
        }
      }
    }
  }

  return new Response(JSON.stringify({ enviados, omitidos, suscripcionesEliminadas }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
