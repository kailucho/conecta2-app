// ============================================================
// misiones — tareas diarias rotativas.
//  - Carga Mental (convivientes/casados): responsabilidad proactiva del hogar.
//  - Atención (novios que no conviven): responsabilidad activa a distancia.
// Cada misión cumplida suma +20 pts. Se elige una por día de forma estable.
// ============================================================

export const MISIONES_CARGA_MENTAL = [
  'Revisa si falta papel higiénico antes de que ella lo note.',
  'Fíjate si hay algo por acabarse en la cocina y anótalo o cómpralo.',
  'Adelántate a lavar los platos sin que te lo pidan.',
  'Saca la basura antes de que se acumule.',
  'Pregunta qué falta para la comida de mañana y encárgate tú.',
  'Ordena un espacio común sin avisar (mesa, sala, lavadero).',
  'Chequea si el caño, la luz o algo necesita arreglo y resuélvelo.',
  'Prepara tú el desayuno o la primera bebida del día.',
  'Revisa la lista del mercado y ve tú esta vez.',
  'Tiende o dobla la ropa antes de que se convierta en montaña.',
  'Fíjate si las mascotas/plantas necesitan algo hoy.',
  'Encárgate de una cuenta o trámite pendiente que suele hacer ella.',
]

export const MISIONES_ATENCION = [
  'Escríbele algo bonito sin ningún motivo.',
  'Pregúntale cómo le fue en eso que te contó ayer.',
  'Recuerda el nombre de esa amiga suya que está en problemas y pregúntale.',
  'Planifica tú la próxima salida, sin que ella lo pida.',
  'Mándale una canción que te hizo acordar a ella.',
  'Pregúntale qué necesita hoy y cumple algo de eso a distancia.',
  'Dile una cosa específica que admiras de ella.',
  'Acuérdate de un detalle chiquito que mencionó y sorpréndela con eso.',
  'Proponle una videollamada solo para verse un rato.',
  'Pregúntale por su día ANTES de que ella pregunte por el tuyo.',
  'Mándale una foto de algo que te alegró y que quieras compartirle.',
  'Recuérdale que la extrañas, sin esperar que ella lo diga primero.',
]

/**
 * Devuelve la misión del día según el tipo de relación.
 * @param {boolean} conviven  true si viven juntos (carga mental)
 * @param {number} semilla    índice estable (p.ej. día del año)
 */
export function misionDelDia(conviven, semilla = 0) {
  const lista = conviven ? MISIONES_CARGA_MENTAL : MISIONES_ATENCION
  const idx = Math.abs(semilla) % lista.length
  return {
    texto: lista[idx],
    puntos: 20,
    tipo: conviven ? 'carga_mental' : 'atencion',
    titulo: conviven ? 'Misión de Carga Mental' : 'Misión de Atención',
    idDia: `${conviven ? 'cm' : 'at'}-${idx}`,
  }
}

/**
 * Clave anti-spam / anti-repetición de una misión completada en un día.
 * Centralizada para que la tarjeta "Para hoy" y cualquier otra vista que
 * complete la misión usen la MISMA clave y no dupliquen puntos.
 */
export function claveMisionHecha(mision, semilla = 0) {
  return `mision:${mision.idDia}:${semilla}`
}
