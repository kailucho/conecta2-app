// ============================================================
// lenguaje — adaptación de textos según rol y tipo de relación.
//
// Regla: todo el contenido usa lenguaje neutral ("tu pareja") y solo dice
// "esposa/esposo" cuando el tipo de relación es "casados". Los niveles de
// gamificación se renombran según el tipo.
// ============================================================

/**
 * Devuelve cómo llamar a la pareja del usuario, según rol y tipo de relación.
 * rol = rol de QUIEN usa la app; la pareja es del rol opuesto.
 */
export function comoLlamarPareja(rol, tipoRelacion) {
  const parejaEsElla = rol === 'el' // si yo soy él, mi pareja es ella
  if (tipoRelacion === 'casados') {
    return parejaEsElla ? 'tu esposa' : 'tu esposo'
  }
  if (tipoRelacion === 'novios') {
    return parejaEsElla ? 'tu chica' : 'tu chico'
  }
  // convivientes u otro
  return 'tu pareja'
}

/**
 * Versión con mayúscula inicial.
 */
export function comoLlamarParejaCap(rol, tipoRelacion) {
  const t = comoLlamarPareja(rol, tipoRelacion)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/**
 * Nombres de los 4 niveles de gamificación, adaptados a rol y tipo.
 */
export function nombresNiveles(rol, tipoRelacion) {
  const esNovios = tipoRelacion === 'novios'
  const pro = rol === 'el'
    ? (esNovios ? 'Novio Pro' : 'Esposo Pro')
    : (esNovios ? 'Novia Pro' : 'Esposa Pro')
  const leyenda = esNovios ? 'Leyenda del Amor' : 'Leyenda del Matrimonio'
  return ['Novato', 'Aprendiz', pro, leyenda]
}

/**
 * Etiqueta corta del tipo de relación (para Ajustes).
 */
export function etiquetaTipoRelacion(tipoRelacion) {
  return {
    casados: '💍 Casados',
    convivientes: '🏠 Convivientes',
    novios: '💌 Enamorados',
  }[tipoRelacion] || 'En pareja'
}

/**
 * ¿La pareja convive con el usuario? (afecta misiones, kit de regla, citas).
 */
export function convivenJuntos(tipoRelacion) {
  return tipoRelacion === 'casados' || tipoRelacion === 'convivientes'
}
