// ============================================================
// etapasVida — configuración y guías de las etapas de vida y modos de
// fertilidad. Todo el contenido es informativo y cariñoso; SIEMPRE incluye la
// nota de que la app no reemplaza consejo médico.
// ============================================================

export const ETAPAS_VIDA = [
  { id: 'regular', emoji: '🔄', label: 'Ciclo regular', desc: 'Ciclos más o menos parejos' },
  { id: 'irregular', emoji: '🌀', label: 'Ciclo irregular', desc: 'Varía bastante de mes a mes' },
  { id: 'postparto', emoji: '🍼', label: 'Postparto', desc: 'Después de dar a luz' },
  { id: 'menopausia', emoji: '🌸', label: 'Peri/Menopausia', desc: 'Transición o menopausia' },
]

export const MODOS_FERTILIDAD = [
  {
    id: 'buscando',
    emoji: '👶',
    label: 'Buscando bebé',
    desc: 'Resaltamos la ventana fértil en positivo',
  },
  {
    id: 'todavia_no',
    emoji: '🚫👶',
    label: 'Todavía no',
    desc: 'Marcamos la ventana fértil como precaución',
  },
]

// Advertencia PERMANENTE y clara en modo "Todavía no".
export const ADVERTENCIA_ANTICONCEPTIVA =
  'El método del calendario NO es un anticonceptivo confiable. Sirve para conocer el ciclo, pero para evitar un embarazo usa un método real (preservativo, anticonceptivos, etc.) y consulta a tu médico. ☢️'

export const NOTA_MEDICA =
  'Esta app acompaña y educa, pero no reemplaza el consejo de un profesional de salud.'

// Guía de postparto.
export const GUIA_POSTPARTO = {
  titulo: 'Modo Postparto 🍼',
  intro:
    'Después del parto el cuerpo y las emociones están en plena montaña rusa, y el ciclo puede tardar en volver (más aún con lactancia). Paciencia y mucho equipo.',
  puntos: [
    'El ciclo puede demorar semanas o meses en regularizarse; es normal.',
    'La lactancia puede retrasar la regla, pero NO garantiza no quedar embarazada.',
    'El cansancio extremo es real: repartan las noches y las tareas.',
    'Si hay tristeza intensa, llanto constante o desconexión con el bebé por varias semanas, puede ser depresión posparto: buscar ayuda profesional no es exagerar, es cuidarse.',
    'Los detalles pequeños (un vaso de agua, dejarla dormir una hora más) valen oro ahora.',
  ],
  paraEl: [
    'Ofrécete para las tareas sin esperar que te las pidan.',
    'Encárgate de visitas y "filtra" para que ella descanse.',
    'Pregúntale cómo se siente de verdad, sin minimizar.',
  ],
}

// Guía de menopausia (esta etapa oculta calendario y velocímetro).
export const GUIA_MENOPAUSIA = {
  titulo: 'Modo Menopausia 🌸',
  intro:
    'La perimenopausia y la menopausia son una etapa natural. Los ciclos se vuelven irregulares hasta desaparecer, y pueden aparecer síntomas nuevos. Nada de esto la hace "menos"; es una etapa más para acompañar con cariño.',
  puntos: [
    'Los bochornos (calores repentinos) son comunes; un ambiente fresco ayuda.',
    'El sueño puede alterarse; la paciencia y la rutina tranquila ayudan.',
    'El ánimo puede variar, y no siempre es hormonal: a veces son cosas reales de la vida.',
    'La libido puede cambiar; conversar sin presión es clave.',
    'Un control médico ayuda a manejar síntomas y descartar otras causas.',
  ],
  paraEl: [
    'No bromees con los bochornos ni con la edad.',
    'Acompaña sin "arreglar"; a veces solo hay que escuchar.',
    'Sé cómplice de los cambios, no un espectador.',
  ],
}

// Tipos de síntomas registrables en menopausia.
export const SINTOMAS_MENOPAUSIA = [
  { id: 'bochornos', emoji: '🔥', label: 'Bochornos' },
  { id: 'sueno', emoji: '😴', label: 'Sueño' },
  { id: 'animo', emoji: '💭', label: 'Ánimo' },
]

// Consejos de concepción para modo "Buscando bebé".
export const TIPS_CONCEPCION = [
  'Los días más fértiles son los previos y el de la ovulación.',
  'Un estilo de vida saludable (sueño, alimentación) ayuda a ambos.',
  'El ácido fólico suele recomendarse desde antes de buscar; consúltalo con tu médico.',
  'El estrés no ayuda: disfruten el proceso sin obsesionarse con el calendario.',
  'Si después de un tiempo prudente no llega, un chequeo médico de ambos es buena idea.',
]
