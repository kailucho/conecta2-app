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
      icon: '/iconos/icono-app.png',
      badge: '/iconos/badge-monocromo.png',
      silent: opciones.silent === true,
    })
    return true
  } catch {
    return false
  }
}

// ============================================================
// Resumen matutino — Nivel 1 (app abierta). Se muestra como mucho una vez
// por fecha, respetando hora/días/fines de semana/zona horaria. No simula
// una notificación programada: solo se dispara cuando la app está abierta y
// ya pasó la hora configurada.
// ============================================================

function horaActualEnZona(zonaHoraria, ahora) {
  try {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: zonaHoraria || undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(ahora)
    const h = partes.find((p) => p.type === 'hour')?.value ?? '00'
    const m = partes.find((p) => p.type === 'minute')?.value ?? '00'
    return `${h}:${m}`
  } catch {
    return `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`
  }
}

function claveFechaLocal(ahora) {
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`
}

/**
 * Decide (de forma pura y testeable) si corresponde mostrar el resumen
 * matutino AHORA MISMO. No tiene efectos secundarios.
 */
export function debeMostrarResumenHoy(resumenMatutino, ahora = new Date()) {
  if (!resumenMatutino?.activo) return false
  const diaSemana = ahora.getDay() // 0=domingo … 6=sábado
  if (Array.isArray(resumenMatutino.dias) && !resumenMatutino.dias.includes(diaSemana)) {
    return false
  }
  if (resumenMatutino.finesSemana === false && (diaSemana === 0 || diaSemana === 6)) {
    return false
  }
  const horaActual = horaActualEnZona(resumenMatutino.zonaHoraria, ahora)
  if (horaActual < (resumenMatutino.hora || '07:00')) return false
  if (resumenMatutino.ultimaFecha === claveFechaLocal(ahora)) return false // idempotencia diaria
  return true
}

/**
 * Construye título/cuerpo del resumen a partir del pronóstico de hoy.
 */
export function contenidoResumenMatutino(pronosticoHoy, resumenMatutino = {}) {
  if (resumenMatutino.contenidoSensible === false) {
    return { titulo: 'Conecta2 tiene listo tu resumen de hoy.', cuerpo: '' }
  }
  if (pronosticoHoy.hayEstadoReal) {
    return {
      titulo: '💗 Tu pareja indicó cómo se siente hoy.',
      cuerpo: `${pronosticoHoy.recomendacionPareja}`,
    }
  }
  const nivel = pronosticoHoy.nivel
  if (nivel <= 4) {
    return {
      titulo: `☀️ Radar tranquilo: ${nivel}/10`,
      cuerpo: 'Buen día para planear algo juntos.',
    }
  }
  if (nivel <= 6) {
    return {
      titulo: `🌥️ Radar variable: ${nivel}/10`,
      cuerpo: 'Podría estar más cansada. Pregunta antes de asumir.',
    }
  }
  return {
    titulo: `🌧️ Radar elevado: ${nivel}/10`,
    cuerpo: 'Hoy se recomienda paciencia, cariño y provisiones de emergencia 😅',
  }
}

/**
 * Muestra el resumen matutino si corresponde y marca la fecha como notificada
 * (para no repetir el mismo día). Devuelve true si lo mostró.
 */
export function mostrarResumenMatutinoSiCorresponde(pronosticoHoy, resumenMatutino, actualizarResumenMatutino, ahora = new Date()) {
  if (!debeMostrarResumenHoy(resumenMatutino, ahora)) return false
  const { titulo, cuerpo } = contenidoResumenMatutino(pronosticoHoy, resumenMatutino)
  notificar(titulo, { body: cuerpo, silent: resumenMatutino.silencio === true })
  actualizarResumenMatutino({ ...resumenMatutino, ultimaFecha: claveFechaLocal(ahora) })
  return true
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
