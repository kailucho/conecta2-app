// ============================================================
// lenguaje — adaptación de textos según convivencia de la pareja.
//
// Regla: todo el contenido usa lenguaje neutral ("tu pareja"), sin depender
// del estado civil. La clasificación se redujo a una decisión binaria de
// convivencia: 'conviven' | 'no_conviven'. Los valores antiguos ('casados',
// 'convivientes', 'novios') se siguen aceptando vía normalizarTipoRelacion()
// para no romper perfiles locales ni registros ya guardados en Supabase.
// ============================================================

/**
 * Normaliza cualquier valor histórico o actual de tipoRelacion al esquema
 * canónico binario. Es la única fuente de esta lógica: úsala al hidratar
 * perfiles locales y remotos en vez de duplicar el mapeo en componentes.
 *
 *   casados, convivientes, conviven       → 'conviven'
 *   novios, no_conviven                   → 'no_conviven'
 *   cualquier otro valor (incluido null)  → se devuelve tal cual (no se inventa)
 */
export function normalizarTipoRelacion(valor) {
  if (valor === 'casados' || valor === 'convivientes' || valor === 'conviven') {
    return 'conviven'
  }
  if (valor === 'novios' || valor === 'no_conviven') {
    return 'no_conviven'
  }
  return valor
}

/**
 * Devuelve cómo llamar a la pareja del usuario. Siempre neutral.
 */
export function comoLlamarPareja() {
  return 'tu pareja'
}

/**
 * Versión con mayúscula inicial.
 */
export function comoLlamarParejaCap() {
  return 'Tu pareja'
}

/**
 * Nombres de los 4 niveles de gamificación. Neutrales, no dependen de rol
 * ni tipo de relación (se mantiene la firma por compatibilidad de llamadas).
 */
export function nombresNiveles() {
  return ['Novato', 'Aprendiz', 'Pareja Pro', 'Leyenda de la Conexión']
}

/**
 * Etiqueta corta de la convivencia (para Ajustes). Acepta valores antiguos.
 */
export function etiquetaTipoRelacion(tipoRelacion) {
  return {
    conviven: '🏠 Viven juntos',
    no_conviven: '💌 Aún no viven juntos',
  }[normalizarTipoRelacion(tipoRelacion)] || 'En pareja'
}

/**
 * ¿La pareja convive con el usuario? (afecta misiones, kit de regla, citas).
 * Reconoce valores nuevos y antiguos.
 */
export function convivenJuntos(tipoRelacion) {
  return normalizarTipoRelacion(tipoRelacion) === 'conviven'
}
