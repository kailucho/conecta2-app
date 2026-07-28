// ============================================================
// assetsPersonajes — registro central de los recursos visuales (imágenes)
// de Astro Azul y Estrellita. Mapea personaje + expresión → ruta del
// archivo, texto alternativo y fallback. Mientras no exista el archivo, la
// UI usa automáticamente el SVG dibujado en JSX (AstroAzul.jsx /
// Estrellita.jsx) — ver docs/asset-inventory.md para el inventario exacto.
//
// La expresión del personaje (ver motor/expresiones.js) tiene más estados
// que los "estados visuales" de las imágenes; ASSET_POR_EXPRESION traduce
// entre ambos vocabularios.
// ============================================================

export const ASSETS_ASTRO = {
  neutral: { archivo: '/personajes/astro/astro-neutral.png', alt: 'Astro Azul, tranquilo y feliz' },
  'abrazando-corazon': { archivo: '/personajes/astro/astro-abrazando-corazon.png', alt: 'Astro Azul abrazando un corazón' },
  preocupado: { archivo: '/personajes/astro/astro-preocupado.png', alt: 'Astro Azul preocupado' },
  casco: { archivo: '/personajes/astro/astro-casco.png', alt: 'Astro Azul con casco de protección' },
  durmiendo: { archivo: '/personajes/astro/astro-durmiendo.png', alt: 'Astro Azul durmiendo' },
  celebrando: { archivo: '/personajes/astro/astro-celebrando.png', alt: 'Astro Azul celebrando' },
  'pidiendo-perdon': { archivo: '/personajes/astro/astro-pidiendo-perdon.png', alt: 'Astro Azul pidiendo perdón' },
  'con-flores': { archivo: '/personajes/astro/astro-con-flores.png', alt: 'Astro Azul con flores' },
}

export const ASSETS_ESTRELLITA = {
  neutral: { archivo: '/personajes/estrellita/estrellita-neutral.png', alt: 'Estrellita, tranquila y feliz' },
  'abrazando-corazon': { archivo: '/personajes/estrellita/estrellita-abrazando-corazon.png', alt: 'Estrellita abrazando un corazón' },
  cansada: { archivo: '/personajes/estrellita/estrellita-cansada.png', alt: 'Estrellita cansada' },
  sensible: { archivo: '/personajes/estrellita/estrellita-sensible.png', alt: 'Estrellita sensible' },
  'con-antojo': { archivo: '/personajes/estrellita/estrellita-con-antojo.png', alt: 'Estrellita con antojo' },
  durmiendo: { archivo: '/personajes/estrellita/estrellita-durmiendo.png', alt: 'Estrellita durmiendo' },
  celebrando: { archivo: '/personajes/estrellita/estrellita-celebrando.png', alt: 'Estrellita celebrando' },
  'molesta-suavemente': { archivo: '/personajes/estrellita/estrellita-molesta-suavemente.png', alt: 'Estrellita un poco molesta' },
}

// Traduce el id de `expresionActual()` (motor/expresiones.js) al estado
// visual de la imagen correspondiente.
export const ASSET_POR_EXPRESION = {
  astro: {
    neutral: 'neutral',
    feliz: 'neutral',
    radiante: 'celebrando',
    tierno: 'con-flores',
    cansado: 'durmiendo',
    sensible: 'preocupado',
    cueva: 'preocupado',
    sorpresa: 'celebrando',
    amor: 'abrazando-corazon',
    pensativo: 'pidiendo-perdon',
  },
  estrellita: {
    neutral: 'neutral',
    feliz: 'neutral',
    radiante: 'celebrando',
    tierno: 'abrazando-corazon',
    cansado: 'cansada',
    sensible: 'sensible',
    cueva: 'sensible',
    sorpresa: 'celebrando',
    amor: 'abrazando-corazon',
    pensativo: 'con-antojo',
  },
}

/**
 * Devuelve { archivo, alt } para (personaje, expresión), o null si la
 * expresión no tiene mapeo (en ese caso, usar directamente el SVG).
 */
export function assetPersonaje(personaje, expresion) {
  const mapaExpresion = ASSET_POR_EXPRESION[personaje]
  const registro = personaje === 'astro' ? ASSETS_ASTRO : ASSETS_ESTRELLITA
  const estado = mapaExpresion?.[expresion]
  if (!estado || !registro[estado]) return null
  return registro[estado]
}
