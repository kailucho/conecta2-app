// ============================================================
// supabaseClient — cliente único de Supabase para toda la app.
//
// Si faltan las variables de entorno, `supabase` queda en `null` y
// `supabaseConfigurado` en `false`. Ningún consumidor debe asumir que el
// cliente existe: siempre hay que revisar `supabaseConfigurado` primero.
// Esto permite que la app siga funcionando 100% en modo local sin quedar
// en blanco cuando Supabase no está configurado (desarrollo, CI, etc).
// ============================================================

import { createClient } from '@supabase/supabase-js'

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL
const CLAVE_SUPABASE = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigurado = Boolean(URL_SUPABASE && CLAVE_SUPABASE)

if (!supabaseConfigurado) {
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY no configuradas. ' +
      'La app seguirá funcionando en modo local (sin cuenta ni sincronización).',
  )
}

export const supabase = supabaseConfigurado
  ? createClient(URL_SUPABASE, CLAVE_SUPABASE, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null
