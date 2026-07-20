// ============================================================
// tiposFase — TODO el contenido por fase del ciclo, en español peruano
// informal. Tono cariñoso, divertido, NUNCA burlón hacia la pareja.
//
// Regla de respeto: los textos usan "puede influir" / "coincide con",
// jamás afirman que una emoción está causada obligatoriamente por hormonas.
//
// Estructura por fase:
//   meta          → nombre, emoji, resumen
//   hormonal      → qué pasa (explicación simple con humor por tono)
//   frasesCabecera→ frase del velocímetro (él) / clima (ella) por tono
//   el            → cómo tratar a la pareja, qué NO hacer, frases, detalles
//   ella          → autocuidado, cuándo decidir, recordatorio
//   tips          → lista general (≥5)
//   frases        → frases sugeridas para decirle (≥5)
// ============================================================

export const CONTENIDO_FASES = {
  menstrual: {
    meta: {
      nombre: 'Menstrual',
      emoji: '🩸',
      resumen: 'Días de regla. Cuerpo en modo descanso y recarga.',
    },
    hormonal: {
      suave:
        'Los niveles de estrógeno y progesterona están bajitos. El cuerpo está haciendo su trabajo y pide descanso.',
      normal:
        'Estrógeno y progesterona por el piso. El cuerpo está laburando fuerte por dentro, así que puede haber cansancio o cólicos.',
      sinfiltro:
        'Hormonas en modo apagado. Está sangrando y con cólicos: literal su cuerpo la está fajando por dentro. Cero exigencias.',
    },
    frasesCabecera: {
      suave: 'Momento de cuidarla con cariño 💗',
      normal: 'Procede con chocolates y paciencia 🍫',
      sinfiltro: 'Alerta cólicos: trae la bolsita caliente YA 🔥',
    },
    el: {
      comoTratar: [
        'Ofrécele su bolsita de agua caliente o una mantita sin que te lo pida.',
        'Encárgate tú de lo pesado del día: platos, mercado, cargar cosas.',
        'Tráele su antojo (chocolate, algo calientito) como detalle sorpresa.',
        'Baja las revoluciones: menos planes exigentes, más peli y sillón.',
      ],
      queNoHacer: [
        'No le digas "¿otra vez estás con eso?" — jamás.',
        'No minimices el cólico con "no es para tanto".',
        'No llenes el día de tareas o compromisos sociales pesados.',
      ],
      frasesSugeridas: [
        '"Yo me encargo de todo hoy, tú descansa 💙"',
        '"¿Te traigo tu bolsita caliente y un chocolate?"',
        '"No tienes que hacer nada, solo dime qué necesitas."',
        '"Ven, échate acá que te consiento."',
        '"¿Peli y mantita? Yo pongo todo."',
      ],
      detalles: [
        'Bolsita de agua caliente lista.',
        'Su chocolate o antojo favorito.',
        'Una peli o serie que le guste, sin que elija ella.',
      ],
    },
    ella: {
      autocuidado: [
        'Date permiso de descansar sin culpa. Tu cuerpo está trabajando.',
        'Calientito en la barriga: bolsita, mate o infusión ayudan un montón.',
        'Hidrátate y come rico; hoy no es día de dietas estrictas.',
        'Si puedes, baja el ritmo y delega lo pesado.',
      ],
      cuandoDecidir:
        'No es el mejor momento para decisiones grandes o discusiones fuertes; date unos días.',
      recordatorio:
        'Estar cansada o sensible hoy es normal y válido. No te exijas de más 💗',
    },
    tips: [
      'El descanso no es flojera: es parte del ciclo.',
      'El calor local (bolsita) alivia el cólico más que aguantarse.',
      'Tomar bastante agua ayuda con la hinchazón.',
      'Movimiento suave (caminar, estirar) puede aliviar molestias.',
      'Si el dolor es muy fuerte o distinto a lo usual, conviene ver a un médico.',
    ],
    frases: [
      '"Estoy acá para lo que necesites 💙"',
      '"Descansa, del resto me encargo yo."',
      '"¿Qué se te antoja? Voy por eso."',
      '"No tienes que ser fuerte hoy, yo te cuido."',
      '"Te amo también en tus días de bajón."',
    ],
  },

  folicular: {
    meta: {
      nombre: 'Folicular',
      emoji: '🌱',
      resumen: 'Sube la energía y el ánimo. Modo optimista y con pilas.',
    },
    hormonal: {
      suave:
        'El estrógeno empieza a subir y con él suele venir más energía y buen ánimo.',
      normal:
        'Estrógeno subiendo: más pila, más ganas de hacer cosas, mejor humor en general.',
      sinfiltro:
        'Estrógeno al alza: modo turbo activado. Está con toda la pila, aprovéchenla.',
    },
    frasesCabecera: {
      suave: 'Buen momento para planes juntos 🌱',
      normal: 'Vía libre: aprovecha la buena onda ✨',
      sinfiltro: 'Verde total: sal, planea, propón. Está on fire 🔥',
    },
    el: {
      comoTratar: [
        'Es buen momento para proponer planes nuevos o esa salida pendiente.',
        'Acompáñala en su energía: ejercicio, proyectos, salir a caminar.',
        'Buen momento para conversar temas importantes con calma.',
        'Reconoce sus logros y sus ganas; se siente motivada.',
      ],
      queNoHacer: [
        'No apagues su entusiasmo con "ya, tranquila".',
        'No dejes pasar la oportunidad de planear algo lindo juntos.',
      ],
      frasesSugeridas: [
        '"Te veo con toda la pila, ¿hacemos algo rico hoy?"',
        '"Me encanta tu energía, ¿salimos?"',
        '"¿Y si planeamos ese viajecito que queríamos?"',
        '"Cuéntame en qué andas, te noto motivada."',
        '"Vamos a aprovechar el día 💙"',
      ],
      detalles: [
        'Proponer una salida o plan nuevo.',
        'Sumarte a algo que ella quiera hacer.',
        'Un mensaje reconociendo sus ganas.',
      ],
    },
    ella: {
      autocuidado: [
        'Aprovecha la energía para lo que venías postergando.',
        'Buen momento para retomar ejercicio o proyectos.',
        'Ideal para conversaciones importantes: estás más clara y receptiva.',
        'Disfruta el buen ánimo sin exigirte a rendir "siempre".',
      ],
      cuandoDecidir:
        'Buen momento para decisiones y planes: sueles estar más enfocada y optimista.',
      recordatorio:
        'Tu energía es tuya, no una obligación. Úsala como quieras 🌱',
    },
    tips: [
      'La energía sube: buen momento para arrancar cosas nuevas.',
      'Ideal para conversaciones importantes en pareja.',
      'El ejercicio se disfruta más en esta fase.',
      'Buen momento para socializar y planear.',
      'Aprovecha, pero no te sobrecargues de compromisos.',
    ],
    frases: [
      '"Me encanta verte así de contenta 💙"',
      '"¿Aprovechamos el día y salimos?"',
      '"Cuéntame tus planes, te apoyo."',
      '"Se nota tu buena energía, contagia."',
      '"Hagamos algo bonito hoy."',
    ],
  },

  ovulacion: {
    meta: {
      nombre: 'Ovulación',
      emoji: '✨',
      resumen: 'Pico de energía y seguridad. Se siente radiante y sociable.',
    },
    hormonal: {
      suave:
        'El estrógeno llega a su punto más alto. Suele ser la fase de mayor seguridad y ganas.',
      normal:
        'Estrógeno en su pico. Más segura, más sociable, más ganas de todo. Fase brillante.',
      sinfiltro:
        'Estrógeno al máximo: modo diosa activado. Está segura, radiante y con ganas. Nota: acá es la ventana fértil, ojo con eso.',
    },
    frasesCabecera: {
      suave: 'Está radiante, disfrútenla ✨',
      normal: 'Pico de energía: dale flores y salidas 💐',
      sinfiltro: 'Modo diosa activado. Conséntela y ojo con la ventana fértil ☢️',
    },
    el: {
      comoTratar: [
        'Hazle saber lo linda que se ve; recibe bien los halagos ahora.',
        'Buen momento para citas, salidas y planes sociales.',
        'Está más sociable y conversadora: dale tu atención plena.',
        'Si cuidan/buscan embarazo, ojo: es la ventana fértil.',
      ],
      queNoHacer: [
        'No la dejes hablando sola mientras ves el celular.',
        'No desaproveches su buena disposición para conectar.',
      ],
      frasesSugeridas: [
        '"Estás guapísima hoy, ¿te lo dije?"',
        '"Te ves feliz y radiante, me encantas."',
        '"¿Salimos a algún lado bonito?"',
        '"Me fascina cuando estás así de segura 💙"',
        '"Cuéntame todo, te escucho."',
      ],
      detalles: [
        'Una cita o salida bonita.',
        'Un halago sincero sobre cómo se ve o cómo es.',
        'Flores o un detalle espontáneo.',
      ],
    },
    ella: {
      autocuidado: [
        'Disfruta tu seguridad y tu brillo, te lo mereces.',
        'Buen momento para eventos sociales o presentaciones importantes.',
        'Si no buscas embarazo, recuerda que esta es la ventana fértil.',
        'Aprovecha para conectar con tu pareja y con la gente que quieres.',
      ],
      cuandoDecidir:
        'Sueles estar segura y persuasiva: buen momento para conversaciones clave.',
      recordatorio:
        'Este brillo eres tú, no una casualidad hormonal. Lúcelo ✨',
    },
    tips: [
      'Suele ser el pico de energía y seguridad del ciclo.',
      'Ideal para citas, salidas y vida social.',
      'Es la ventana fértil: importante saberlo busques o no embarazo.',
      'Buen momento para pedir cosas o negociar con calma.',
      'Aprovecha para conectar en pareja.',
    ],
    frases: [
      '"Te ves increíble hoy 💙"',
      '"Me encanta tu seguridad."',
      '"¿Nos escapamos a una cita?"',
      '"Disfruto un montón estar contigo así."',
      '"Eres un lujo, ¿sabías?"',
    ],
  },

  lutea: {
    meta: {
      nombre: 'Lútea',
      emoji: '🌙',
      resumen: 'Baja la energía de a pocos. Más sensible o introspectiva.',
    },
    hormonal: {
      suave:
        'Sube la progesterona y baja el estrógeno. Puede venir más sensibilidad o ganas de calma.',
      normal:
        'Progesterona arriba, estrógeno bajando. Puede haber más sensibilidad, antojos o ganas de tranquilidad. Los últimos días son la Zona Roja.',
      sinfiltro:
        'Progesterona mandando. Puede estar más sensible, con antojos y menos paciencia para tonterías. Los últimos días son Zona Roja: máxima ternura.',
    },
    frasesCabecera: {
      suave: 'Un poco más de ternura le cae bien 🌙',
      normal: 'Modo sensible: paciencia y detalles 💗',
      sinfiltro: 'Zona Roja cargando: escudo de paciencia arriba 🛡️',
    },
    el: {
      comoTratar: [
        'Sube la ternura y baja las exigencias; hoy pesa más el cariño.',
        'Ten a la mano sus antojos: chocolate, salado, lo que le provoque.',
        'Si algo la incomoda, escucha sin apurarte a "arreglarlo".',
        'Dale espacio si lo pide, pero hazle saber que estás ahí.',
      ],
      queNoHacer: [
        'No le digas "estás exagerando" ni "es la regla, ¿no?".',
        'No saques temas conflictivos justo ahora si pueden esperar.',
        'No la dejes sola sintiéndose ignorada.',
      ],
      frasesSugeridas: [
        '"Te escucho, no tienes que explicarte."',
        '"¿Quieres que te acompañe o prefieres un ratito sola?"',
        '"Te traje tu antojito 🍫"',
        '"Estoy acá para ti, pase lo que pase 💙"',
        '"Nada de exigencias hoy, solo cariño."',
      ],
      detalles: [
        'Su antojo listo antes de que lo pida.',
        'Un abrazo largo sin apuro.',
        'Hacerte cargo de algo que le da flojera hoy.',
      ],
    },
    ella: {
      autocuidado: [
        'Si te sientes más sensible, está bien; date permiso de sentir.',
        'Antojos: dales espacio sin culpa, con equilibrio.',
        'Baja el ritmo los últimos días; el cuerpo pide calma.',
        'Evita decisiones impulsivas grandes justo antes de la regla.',
      ],
      cuandoDecidir:
        'En los últimos días quizás no sea ideal decidir cosas grandes; espera a estar más tranquila.',
      recordatorio:
        'No eres "difícil": estás más sensible y eso también merece cariño. No siempre es la progesterona, a veces algo real te afecta y también vale 💗',
    },
    tips: [
      'La energía baja de a pocos: normal querer más calma.',
      'Los antojos son comunes; equilibra sin culparte.',
      'Buen momento para tareas tranquilas, no para maratones.',
      'La Zona Roja son los últimos ~5 días: máxima autocompasión.',
      'Si el ánimo bajo es muy intenso cada mes, vale conversarlo con un profesional.',
    ],
    frases: [
      '"Te escucho, aquí estoy 💙"',
      '"¿Te traigo algo rico?"',
      '"No tienes que estar bien todo el tiempo."',
      '"Te abrazo el tiempo que quieras."',
      '"Pase lo que pase, estoy contigo."',
    ],
  },
}

/**
 * Devuelve el contenido de una fase por su id ('menstrual', etc.).
 */
export function contenidoFase(faseId) {
  return CONTENIDO_FASES[faseId] || CONTENIDO_FASES.folicular
}

/**
 * Frase de cabecera (velocímetro/clima) según fase y tono de humor.
 */
export function fraseCabecera(faseId, tono = 'normal') {
  const c = contenidoFase(faseId)
  return c.frasesCabecera[tono] || c.frasesCabecera.normal
}

/**
 * Explicación hormonal según fase y tono.
 */
export function explicacionHormonal(faseId, tono = 'normal') {
  const c = contenidoFase(faseId)
  return c.hormonal[tono] || c.hormonal.normal
}

/**
 * Devuelve un tip "del día" pseudo-rotativo por fecha (estable en el día).
 */
export function tipDelDia(faseId, semilla = 0) {
  const c = contenidoFase(faseId)
  const idx = Math.abs(semilla) % c.tips.length
  return c.tips[idx]
}
