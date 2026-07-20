// ============================================================
// notificaciones — Notification API local + filtro de privacidad.
//
// REGLA DE PRIVACIDAD: una notificación visible en pantalla bloqueada NUNCA
// menciona la fase menstrual, salvo autorización expresa en el nivel de
// privacidad. Este servicio centraliza ese filtro.
// ============================================================

/**
 * Pide permiso de notificaciones al usuario (idealmente tras el onboarding).
 */
export async function pedirPermiso() {
  if (!('Notification' in window)) return 'no_soportado'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

const PALABRAS_SENSIBLES = /regla|menstrua|ovula|fértil|fertil|hormona|zona roja/i

/**
 * Muestra una notificación local, aplicando el filtro de privacidad.
 *
 * @param {string} titulo
 * @param {object} opciones  { body, ocultarSensible }
 */
export function notificar(titulo, opciones = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false
  }

  let cuerpo = opciones.body || ''
  // Si se pide ocultar contenido sensible y el texto lo contiene, lo reemplaza.
  if (opciones.ocultarSensible && PALABRAS_SENSIBLES.test(cuerpo)) {
    cuerpo = 'Tu pareja te mandó algo 💙'
  }

  try {
    new Notification(titulo, {
      body: cuerpo,
      icon: '/iconos/icono-app.svg',
      badge: '/iconos/favicon.svg',
      silent: opciones.silent === true,
    })
    return true
  } catch {
    return false
  }
}

/**
 * Vibración corta opcional (si el dispositivo y la config lo permiten).
 */
export function vibrar(patron = [40], activada = true) {
  if (!activada) return
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(patron)
    } catch {
      /* algunos navegadores lo bloquean sin gesto del usuario */
    }
  }
}
