// ============================================================
// diccionario — traductor estático (fallback sin IA) de frases clásicas.
// Con humor cariñoso, nunca burlón. "Esposa-Español" y "Esposo-Español".
// ============================================================

// Frases típicas y su "traducción" + cómo responder + nivel de gravedad.
export const DICCIONARIO_ELLA = [
  {
    frase: 'haz lo que quieras',
    significa: 'NO hagas lo que quieres. Le importa y se sintió no tomada en cuenta.',
    responde: 'Para y pregúntale qué preferiría de verdad. No lo tomes literal.',
    gravedad: 'alta',
  },
  {
    frase: 'estoy bien',
    significa: 'Puede que no esté bien. A veces es un "quiero que notes que algo pasa".',
    responde: 'Con cariño: "te noto un poco distinta, ¿quieres contarme?".',
    gravedad: 'media',
  },
  {
    frase: 'no pasa nada',
    significa: 'Puede que sí pase algo. Está dando espacio a que preguntes bien.',
    responde: 'No te alivies tan rápido; muestra que estás disponible.',
    gravedad: 'media',
  },
  {
    frase: 'ya no importa',
    significa: 'Sí importa, y bastante. Se sintió no escuchada antes.',
    responde: 'Retoma el tema con calma y valida lo que sintió.',
    gravedad: 'alta',
  },
  {
    frase: 'como tú digas',
    significa: 'Está cediendo pero no convencida. Ojo con darlo por ganado.',
    responde: 'Asegúrate de que sea un acuerdo real, no una rendición.',
    gravedad: 'media',
  },
]

export const DICCIONARIO_EL = [
  {
    frase: 'estoy cansado',
    significa: 'Puede ser cansancio real o necesidad de desconectar un rato.',
    responde: 'Dale un respiro sin reclamos; luego retomen.',
    gravedad: 'baja',
  },
  {
    frase: 'ya lo veo yo',
    significa: 'A veces = "no me presiones con esto ahorita".',
    responde: 'Acuerden un cuándo concreto para que no quede en el aire.',
    gravedad: 'media',
  },
  {
    frase: 'no es para tanto',
    significa: 'Suele restarle importancia a algo que a ti sí te afecta.',
    responde: 'Explícale por qué sí te importa, sin pelear.',
    gravedad: 'media',
  },
  {
    frase: 'estoy escuchando',
    significa: 'Puede estar a medias. No siempre significa atención plena.',
    responde: 'Pídele contacto visual o retomar sin pantallas.',
    gravedad: 'baja',
  },
]

/**
 * Busca una frase en el diccionario del rol de la PAREJA (a quien traduzco).
 * @param {string} texto  lo que dijo la pareja
 * @param {'el'|'ella'} rolPareja  rol de quien lo dijo
 */
export function traducirEstatico(texto, rolPareja) {
  const dicc = rolPareja === 'ella' ? DICCIONARIO_ELLA : DICCIONARIO_EL
  const t = (texto || '').toLowerCase().trim()
  const match = dicc.find((d) => t.includes(d.frase))
  if (match) return match
  return {
    frase: texto,
    significa:
      'No tengo esa frase exacta en el diccionario, pero cuando algo suena cortante, casi siempre por detrás hay una necesidad no dicha.',
    responde:
      'Pregunta con calma y curiosidad: "¿me ayudas a entender qué necesitas?".',
    gravedad: 'media',
  }
}
