// ============================================================
// manias — "Detector de Manías 🧦": checklist de hábitos con humor cariñoso.
// Versión convivientes (hogar) y versión noviazgo (a distancia). Con rachas
// estilo Duolingo. NO es para reclamar ni humillar: es un juego liviano.
// ============================================================

// Manías observables del hogar (convivientes/casados).
export const MANIAS_HOGAR = [
  { id: 'ropa_suelo', emoji: '🧦', texto: 'Dejó ropa tirada en el suelo' },
  { id: 'envase_vacio', emoji: '🥤', texto: 'Guardó envase vacío en la refri' },
  { id: 'rollo', emoji: '🧻', texto: 'Dejó el rollo sin cambiar' },
  { id: 'maraton_juegos', emoji: '🎮', texto: 'Maratón de juegos sin avisar' },
  { id: 'platos', emoji: '🍽️', texto: 'Dejó los platos "para después"' },
  { id: 'luces', emoji: '💡', texto: 'Dejó todas las luces prendidas' },
  { id: 'toalla_cama', emoji: '🛏️', texto: 'Toalla mojada sobre la cama' },
  { id: 'visto', emoji: '👀', texto: 'Te dejó en visto estando en casa' },
]

// Versión noviazgo (a distancia): manías de la relación, no del hogar.
export const MANIAS_NOVIAZGO = [
  { id: 'visto', emoji: '👀', texto: 'Te dejó en visto un buen rato' },
  { id: 'ok_seco', emoji: '😐', texto: 'Respondió con un "ok" seco' },
  { id: 'tarde_cita', emoji: '⏰', texto: 'Llegó tarde a la cita' },
  { id: 'celular_juntos', emoji: '📱', texto: 'Estuvo en el celular cuando estaban juntos' },
  { id: 'olvido', emoji: '🤔', texto: 'Olvidó algo que le contaste' },
  { id: 'plan_cancelado', emoji: '🙃', texto: 'Canceló un plan a último minuto' },
  { id: 'audio_eterno', emoji: '🎙️', texto: 'Audio de 10 minutos sin respirar' },
  { id: 'no_llamo', emoji: '📵', texto: 'Quedó en llamar y no llamó' },
]

/**
 * Devuelve la lista de manías según si conviven.
 */
export function listaManias(conviven) {
  return conviven ? MANIAS_HOGAR : MANIAS_NOVIAZGO
}
