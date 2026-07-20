// ============================================================
// logros — logros desbloqueables con humor cariñoso. Cada uno tiene una
// condición evaluada contra el estado. NUNCA castigan ni comparan.
// ============================================================

export const LOGROS = [
  {
    id: 'primer_paso',
    emoji: '🌱',
    titulo: 'Primer paso',
    desc: 'Enviaste tu primera acción o gesto.',
    condicion: (e) => contarTipos(e.interacciones, ['quick_action', 'animo', 'aprecio']) >= 1,
  },
  {
    id: 'detallista',
    emoji: '💝',
    titulo: 'Detallista',
    desc: 'Cumpliste 3 deseos de tu pareja.',
    condicion: (e) => (e.nosotros.deseos || []).filter((d) => d.cumplido).length >= 3,
  },
  {
    id: 'oido_de_oro',
    emoji: '👂',
    titulo: 'Oído de oro',
    desc: 'Registraste 5 aprecios diarios.',
    condicion: (e) => contarTipos(e.interacciones, ['aprecio']) >= 5,
  },
  {
    id: 'cita_fija',
    emoji: '💑',
    titulo: 'Cita fija',
    desc: 'Cumplieron 4 citas semanales.',
    condicion: (e) => (e.nosotros.citas || []).filter((c) => c.cumplida).length >= 4,
  },
  {
    id: 'sobreviviente_zona_roja',
    emoji: '🛡️',
    titulo: 'Sobreviviste 3 Zonas Rojas seguidas',
    desc: 'Mantuviste la calma y el cariño en las épocas sensibles.',
    condicion: (e) => (e.gamificacion.zonasRojasRespetadas || 0) >= 3,
  },
  {
    id: 'racha_manias',
    emoji: '🔥',
    titulo: 'Racha imparable',
    desc: 'Llegaste a una racha de 7 en el detector de manías.',
    condicion: (e) =>
      Object.values(e.gamificacion.rachas || {}).some((r) => r.dias >= 7),
  },
  {
    id: 'pacificador',
    emoji: '🕊️',
    titulo: 'Pacificador',
    desc: 'Usaste la pausa consciente para calmar una discusión.',
    condicion: (e) =>
      (e.interacciones || []).some((it) => it.actionId === 'pausa_consciente'),
  },
  {
    id: 'nivel_pro',
    emoji: '⭐',
    titulo: 'De otro nivel',
    desc: 'Llegaste al nivel Pro.',
    condicion: (e) => e.gamificacion.puntos >= 300,
  },
  {
    id: 'leyenda',
    emoji: '🏆',
    titulo: 'Leyenda',
    desc: 'Alcanzaste el nivel máximo. Grandes 💫',
    condicion: (e) => e.gamificacion.puntos >= 700,
  },
  {
    id: 'buen_equipo',
    emoji: '🤝',
    titulo: 'Buen equipo',
    desc: 'Sumaron 20 gestos de conexión positivos.',
    condicion: (e) => (e.interacciones || []).filter((it) => it.valencia > 0).length >= 20,
  },
]

function contarTipos(interacciones = [], tipos) {
  return interacciones.filter((it) => tipos.includes(it.type)).length
}

/**
 * Devuelve la lista de ids de logros desbloqueados según el estado.
 */
export function evaluarLogros(estado) {
  return LOGROS.filter((l) => {
    try {
      return l.condicion(estado)
    } catch {
      return false
    }
  }).map((l) => l.id)
}
