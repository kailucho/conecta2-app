// ============================================================
// mensajesWhatsApp — frases naturales para preparar en WhatsApp por acción y
// tono. La selección es DETERMINISTA por (accionId, tono, semilla) para que
// el texto no cambie en cada render dentro del mismo día/acción.
//
// Tonos: suave | divertido | directo | sinfiltro (sin filtro, pero
// respetuoso — nunca ofensivo hacia la pareja).
// ============================================================

export const TONOS_MENSAJE = ['suave', 'divertido', 'directo', 'sinfiltro']

export const MENSAJES_WHATSAPP = {
  hambre: {
    suave: ['Amor, ¿me ayudas con algo de comer? 🍔', 'Tengo un poco de hambre, ¿me consientes?'],
    divertido: ['Amor, mi radar detectó una emergencia alimenticia 😅🍔', 'Alerta roja: estómago vacío 🚨🍔'],
    directo: ['Tengo hambre, ¿pedimos algo?', '¿Me traes algo de comer?'],
    sinfiltro: ['Amor, si no como ya, no respondo 😂🍔', 'Hambre nivel crítico, se solicita comida YA'],
  },
  engreir: {
    suave: ['Amor, hoy necesito una dosis extra de cariño 🥺', 'Hoy me vendría bien que me consientas un poco.'],
    divertido: ['Modo consentir activado, se busca voluntario 🥺✨', 'Hoy necesito mimos, ¿te postulas?'],
    directo: ['Hoy quiero que me engrías un poco.', '¿Me consientes hoy?'],
    sinfiltro: ['Hoy ando en modo "quiero mimos ya" 🥺', 'Necesito que me consientas, sin peros.'],
  },
  abrazo: {
    suave: ['Hoy mi batería emocional necesita un abrazo tuyo 🫂', 'Me vendría bien un abrazo tuyo ahora.'],
    divertido: ['Batería emocional al 2%, se requiere abrazo urgente 🔋🫂', 'Abrazo de emergencia, por favor 🫂'],
    directo: ['Necesito un abrazo.', '¿Me das un abrazo hoy?'],
    sinfiltro: ['Vengo por mi abrazo, no aceptes un no por respuesta 🫂', 'Hoy sí o sí necesito un abrazo tuyo.'],
  },
  momento: {
    suave: ['Amor, estoy un poco saturada. Necesito un momento para tranquilizarme y luego hablamos con calma 💗', 'Necesito un rato para mí, después conversamos con calma.'],
    divertido: ['Modo recarga activado 🔌 vuelvo en un ratito.', 'Necesito unos minutos en modo avión 🛫'],
    directo: ['Necesito espacio un momento.', 'Dame un rato a solas y luego hablamos.'],
    sinfiltro: ['Ahora mismo necesito silencio, no es nada tuyo.', 'Dame un momento, después conversamos bien.'],
  },
  meti_pata: {
    suave: ['Creo que Astro acaba de activar el protocolo de disculpas 😅. ¿Podemos hablar con calma?', 'Creo que metí la pata, ¿hablamos?'],
    divertido: ['Astro activó modo "pidiendo perdón" 😅, ¿me perdonas?', 'Alerta: Astro entró en modo disculpas oficiales 😅'],
    directo: ['Creo que metí la pata, quiero arreglarlo.', 'Perdón, ¿hablamos cuando puedas?'],
    sinfiltro: ['Sé que la regué, hablemos cuando tengas un rato.', 'Metí la pata, lo sé. ¿Conversamos?'],
  },
  antojo: {
    suave: ['Amor, tengo un antojito 🍫, ¿me ayudas?', 'Se me antojó algo rico, ¿me consientes?'],
    divertido: ['Antojo detectado, se requiere intervención inmediata 🍫', 'Mi antojo y yo te necesitamos 🍫'],
    directo: ['Tengo un antojo, ¿me lo traes?', '¿Me consigues algo dulce?'],
    sinfiltro: ['Antojo urgente, hoy sí es en serio 🍫', 'Necesito ese antojo o no respondo 😂'],
  },
  extrano: {
    suave: ['Te extraño un montón 💕', 'Ando pensando mucho en ti hoy 💕'],
    divertido: ['Mi radar de nostalgia se activó, te extraño 💕', 'Nivel de extrañarte: crítico 💕'],
    directo: ['Te extraño.', 'Quiero verte pronto.'],
    sinfiltro: ['Te extraño y no lo voy a disimular.', 'Ven ya, te extraño demasiado.'],
  },
  besitos: {
    suave: ['Quiero mandarte muchos besitos 😘', 'Un besito para ti, aunque sea de lejos 😘'],
    divertido: ['Se te acumularon los besitos, ven a cobrarlos 😘', 'Reclamo oficial de besitos pendientes 😘'],
    directo: ['Quiero besitos.', 'Ven que te debo besitos.'],
    sinfiltro: ['Vengo por mis besitos, sin excusas 😘', 'Hoy sí o sí necesito besitos tuyos.'],
  },
  buena_noticia: {
    suave: ['Tengo algo bonito que contarte 🎉', 'Pasó algo lindo y quiero compartirlo contigo.'],
    divertido: ['Alerta de buena noticia, prepárate 🎉', 'Tengo chisme bueno, ¡y es sobre algo lindo! 🎉'],
    directo: ['Tengo una buena noticia.', 'Te cuento algo bueno cuando puedas.'],
    sinfiltro: ['Tengo una noticia buenísima, ¡no aguanto contártela!', 'Ven que tengo algo increíble que contarte.'],
  },
  ganas_verte: {
    suave: ['Tengo ganas de verte hoy 😏', 'Me gustaría pasar un rato contigo.'],
    divertido: ['Se activó el radar de "quiero verte" 😏', 'Modo "te extraño y quiero verte" activado 😏'],
    directo: ['Quiero verte hoy.', '¿Nos vemos?'],
    sinfiltro: ['Hoy sí quiero verte, sin peros.', 'Necesito verte, punto.'],
  },
  cita: {
    suave: ['¿Te gustaría que salgamos juntos pronto? 🌹', 'Me encantaría planear una cita contigo.'],
    divertido: ['Se solicita tu presencia en una cita oficial 🌹', 'Propongo cita, aceptas más rápido si dices sí 🌹'],
    directo: ['Propongo una cita, ¿cuándo puedes?', '¿Salimos esta semana?'],
    sinfiltro: ['Quiero una cita contigo, ya extraño salir juntos.', 'Organicemos una cita, sin excusas 🌹'],
  },
  corazon: {
    suave: ['Solo quería decirte que estoy pensando en ti 💗', 'Un mensajito para recordarte que te quiero 💗'],
    divertido: ['Alerta de cariño repentino 💗', 'Se me salió un pensamiento bonito sobre ti 💗'],
    directo: ['Pensando en ti 💗', 'Te quiero, eso es todo.'],
    sinfiltro: ['Te quiero un montón, ahí lo dejo 💗', 'Vengo a recordarte que te quiero, nada más.'],
  },
}

const MENSAJES_GENERICOS = {
  suave: ['Amor, quería decirte algo con cariño.', 'Hola, ¿tienes un momento para hablar?'],
  divertido: ['Astro te manda saluditos 😅', 'Mensaje sorpresa de tu persona favorita 💙'],
  directo: ['Quería contarte algo.', 'Hablemos cuando puedas.'],
  sinfiltro: ['Necesito decirte algo, sin rodeos.', 'Vamos al grano: quiero hablar contigo.'],
}

/**
 * Selección determinista de una frase para (accionId, tono, semilla).
 * La misma combinación siempre devuelve el mismo texto (no cambia en cada
 * render), pero rota entre variantes según la semilla del día.
 */
export function mensajePreparado(accionId, tono = 'divertido', semilla = 0) {
  const grupo = MENSAJES_WHATSAPP[accionId] || MENSAJES_GENERICOS
  const lista = grupo[tono] || grupo.divertido || Object.values(grupo)[0]
  if (!lista || lista.length === 0) return ''
  const idx = Math.abs(Math.round(semilla)) % lista.length
  return lista[idx]
}

export function accionesConMensaje() {
  return Object.keys(MENSAJES_WHATSAPP)
}
