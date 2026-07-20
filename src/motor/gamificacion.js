// ============================================================
// gamificacion — puntos, niveles y logros. Lógica pura.
//
// REGLAS ESTRICTAS (respeto emocional):
//  - Nunca resta puntos ni castiga a la pareja.
//  - Nunca compara ni dice "no hiciste suficiente".
//  - Anti-spam: la misma acción repetida en poco tiempo no vuelve a sumar.
//  - Toda la gamificación es desactivable sin perder la comunicación.
// ============================================================

// Umbrales de puntos por nivel (índice = nivel).
export const UMBRALES_NIVEL = [0, 100, 300, 700]

/**
 * Calcula el nivel (0..3) a partir de los puntos.
 */
export function calcularNivel(puntos) {
  let nivel = 0
  for (let i = 0; i < UMBRALES_NIVEL.length; i++) {
    if (puntos >= UMBRALES_NIVEL[i]) nivel = i
  }
  return nivel
}

/**
 * Progreso (0..1) dentro del nivel actual hacia el siguiente.
 */
export function progresoNivel(puntos) {
  const nivel = calcularNivel(puntos)
  const base = UMBRALES_NIVEL[nivel]
  const siguiente = UMBRALES_NIVEL[nivel + 1]
  if (siguiente === undefined) return 1 // nivel máximo
  return (puntos - base) / (siguiente - base)
}

/**
 * Puntos que faltan para el siguiente nivel (null si es el máximo).
 */
export function faltanParaSubir(puntos) {
  const nivel = calcularNivel(puntos)
  const siguiente = UMBRALES_NIVEL[nivel + 1]
  if (siguiente === undefined) return null
  return siguiente - puntos
}

/**
 * Suma puntos con control anti-spam por clave de acción. Devuelve el nuevo
 * estado de gamificación (o el mismo si el anti-spam bloqueó la suma).
 *
 * @param {object} gamificacion  estado actual
 * @param {number} puntos        puntos a sumar
 * @param {string} claveAntiSpam identificador de la acción (opcional)
 * @param {number} ventanaMin    minutos de bloqueo por clave (default 30)
 */
export function sumarPuntos(gamificacion, puntos, claveAntiSpam = null, ventanaMin = 30) {
  const ahora = Date.now()
  const anti = gamificacion.antiSpam || {}

  if (claveAntiSpam) {
    const ultimo = anti[claveAntiSpam]
    if (ultimo && ahora - ultimo < ventanaMin * 60 * 1000) {
      // Bloqueado por anti-spam: no suma, pero no es un error ni un castigo.
      return { estado: gamificacion, sumo: false }
    }
    anti[claveAntiSpam] = ahora
  }

  const nuevosPuntos = gamificacion.puntos + puntos
  const nivelAntes = calcularNivel(gamificacion.puntos)
  const nivelDespues = calcularNivel(nuevosPuntos)

  return {
    estado: {
      ...gamificacion,
      puntos: nuevosPuntos,
      nivel: nivelDespues,
      antiSpam: anti,
    },
    sumo: true,
    subioNivel: nivelDespues > nivelAntes,
    nivelNuevo: nivelDespues,
  }
}
