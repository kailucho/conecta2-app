// ============================================================
// authService — autenticación sin contraseña (email + OTP de 6 dígitos)
// usando Supabase Auth.
//
// Si Supabase no está configurado, todas las funciones devuelven un error
// controlado `{ ok: false, motivo: 'supabase_no_configurado' }` en vez de
// lanzar excepciones, para que la UI pueda degradar con calma.
// ============================================================

import { supabase, supabaseConfigurado } from './supabaseClient.js'

const SIN_CONFIGURAR = { ok: false, motivo: 'supabase_no_configurado' }

/** Envía un código OTP de 6 dígitos al correo indicado. */
export async function enviarOTP(email) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const correo = (email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return { ok: false, motivo: 'correo_invalido' }
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: correo,
    options: { shouldCreateUser: true },
  })
  if (error) {
    return { ok: false, motivo: mapearErrorAuth(error) }
  }
  return { ok: true }
}

/** Verifica el código OTP y crea la sesión. */
export async function verificarOTP(email, codigo) {
  if (!supabaseConfigurado) return SIN_CONFIGURAR
  const correo = (email || '').trim().toLowerCase()
  const token = (codigo || '').trim()
  if (!/^\d{6}$/.test(token)) {
    return { ok: false, motivo: 'codigo_invalido' }
  }
  const { data, error } = await supabase.auth.verifyOtp({
    email: correo,
    token,
    type: 'email',
  })
  if (error) {
    return { ok: false, motivo: mapearErrorAuth(error) }
  }
  return { ok: true, sesion: data.session, usuario: data.user }
}

/** Devuelve la sesión actual (o null) sin lanzar si Supabase no está configurado. */
export async function sesionActual() {
  if (!supabaseConfigurado) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

/** Cierra sesión y limpia el estado de Supabase Auth en el navegador. */
export async function cerrarSesion() {
  if (!supabaseConfigurado) return { ok: true }
  const { error } = await supabase.auth.signOut()
  if (error) return { ok: false, motivo: 'error_inesperado' }
  return { ok: true }
}

/**
 * Suscribe un callback a cambios de sesión (login, logout, refresh, expiración).
 * Devuelve una función para cancelar la suscripción.
 */
export function onAuthChange(callback) {
  if (!supabaseConfigurado) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
    callback(sesion)
  })
  return () => data.subscription.unsubscribe()
}

function mapearErrorAuth(error) {
  const msg = (error?.message || '').toLowerCase()
  if (msg.includes('token has expired') || msg.includes('expired')) return 'otp_expirado'
  if (msg.includes('invalid') && msg.includes('otp')) return 'otp_incorrecto'
  if (msg.includes('rate limit')) return 'demasiados_intentos'
  if (msg.includes('network') || msg.includes('fetch')) return 'sin_conexion'
  return 'error_inesperado'
}
