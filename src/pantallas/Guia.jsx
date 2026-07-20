// ============================================================
// Guía 📖 — contenido educativo por rol.
//   Ambos: 4 fases expandibles + Los 4 Nubarrones + test + postparto/menopausia.
//   Modo él: Entrenador de Escucha, Anti-Roommates.
//   Modo ella: Manual del Esposo (la cueva, crítica vs pedido, gestos, cariño).
// ============================================================

import { usarApp } from '../contexto/AppContexto.jsx'
import Acordeon from '../componentes/comunes/Acordeon.jsx'
import { TarjetaNubarron } from '../componentes/nubarrones/Nubarron.jsx'
import TestNubarron from '../componentes/nubarrones/TestNubarron.jsx'
import Traductor from '../componentes/ia/Traductor.jsx'
import GeneradorMensajes from '../componentes/ia/GeneradorMensajes.jsx'
import { CONTENIDO_FASES } from '../datos/tiposFase.js'
import { LISTA_NUBARRONES } from '../datos/nubarrones.js'
import { MANUAL_ESPOSO } from '../datos/guiaEsposo.js'
import {
  GUIA_POSTPARTO,
  GUIA_MENOPAUSIA,
  NOTA_MEDICA,
} from '../datos/etapasVida.js'

const ORDEN_FASES = ['menstrual', 'folicular', 'ovulacion', 'lutea']

// Lista con viñetas y color opcional.
function Lista({ titulo, items, tono = 'neutral' }) {
  const color = {
    bueno: 'text-exito',
    malo: 'text-peligro',
    neutral: 'text-texto-2',
  }[tono]
  const marca = { bueno: '✅', malo: '❌', neutral: '•' }[tono]
  return (
    <div className="mt-3">
      {titulo && (
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-texto-3">
          {titulo}
        </p>
      )}
      <ul className="space-y-1">
        {items.map((t, i) => (
          <li key={i} className={`text-sm ${color}`}>
            <span className="mr-1">{marca}</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FaseGuia({ faseId, rol, tono }) {
  const c = CONTENIDO_FASES[faseId]
  return (
    <Acordeon titulo={`Fase ${c.meta.nombre}`} subtitulo={c.meta.resumen} emoji={c.meta.emoji}>
      <p className="text-sm text-texto-2">{c.hormonal[tono] || c.hormonal.normal}</p>

      {rol === 'el' ? (
        <>
          <Lista titulo="Cómo tratarla" items={c.el.comoTratar} tono="bueno" />
          <Lista titulo="Qué NO hacer" items={c.el.queNoHacer} tono="malo" />
          <Lista titulo="Frases que suman" items={c.el.frasesSugeridas} />
          <Lista titulo="Ideas de detalles" items={c.el.detalles} />
        </>
      ) : (
        <>
          <Lista titulo="Autocuidado" items={c.ella.autocuidado} tono="bueno" />
          <div className="mt-3 rounded-xl bg-tarjeta-hover p-3">
            <p className="text-xs font-bold text-texto-3">Sobre decisiones:</p>
            <p className="text-sm text-texto-2">{c.ella.cuandoDecidir}</p>
          </div>
          <p className="mt-2 text-sm italic text-texto-2">{c.ella.recordatorio}</p>
        </>
      )}
    </Acordeon>
  )
}

export default function Guia({ alVolver }) {
  const { perfil } = usarApp()
  const rol = perfil.rol
  const tono = perfil.tonoHumor

  return (
    <div className="animate-aparecer space-y-4">
      {alVolver && (
        <button
          onClick={alVolver}
          className="text-sm font-semibold text-acento"
        >
          ← Más
        </button>
      )}
      <h1 className="font-titulo text-2xl font-bold text-texto">Guía 📖</h1>

      {/* Las 4 fases */}
      <section className="space-y-2">
        <h2 className="font-titulo text-lg font-bold text-texto">
          Las 4 fases del ciclo
        </h2>
        {ORDEN_FASES.map((f) => (
          <FaseGuia key={f} faseId={f} rol={rol} tono={tono} />
        ))}
      </section>

      {/* Herramientas de comunicación (IA con fallback) */}
      <section className="space-y-2">
        <h2 className="font-titulo text-lg font-bold text-texto">
          Herramientas 🤖
        </h2>
        <Acordeon titulo="Traductor" subtitulo="¿Qué me quiso decir?" emoji="🕵️">
          <Traductor />
        </Acordeon>
        <Acordeon titulo="Generador de mensajes" subtitulo="Ideas cariñosas al toque" emoji="💌">
          <GeneradorMensajes />
        </Acordeon>
      </section>

      {/* Los 4 Nubarrones */}
      <section className="space-y-2">
        <h2 className="font-titulo text-lg font-bold text-texto">
          Los enemigos de su relación ⛈️
        </h2>
        <p className="text-sm text-texto-2">
          Son 4 nubarrones que atacan a toda pareja. Conocerlos ayuda a
          espantarlos antes de que hagan daño.
        </p>
        {LISTA_NUBARRONES.map((n) => (
          <TarjetaNubarron key={n.id} nubarron={n} />
        ))}
        <Acordeon titulo="¿Cuál es tu nubarrón?" subtitulo="Test rápido de 4 preguntas" emoji="🧭">
          <TestNubarron />
        </Acordeon>
      </section>

      {/* Secciones específicas por rol */}
      {rol === 'ella' ? (
        <section className="space-y-2">
          <h2 className="font-titulo text-lg font-bold text-texto">
            Manual del Esposo 💙
          </h2>
          {Object.values(MANUAL_ESPOSO).map((s) => (
            <Acordeon key={s.titulo} titulo={s.titulo}>
              <p className="text-sm text-texto-2">{s.intro}</p>
              {s.porQue && <Lista titulo="Por qué pasa" items={s.porQue} />}
              {s.funciona && <Lista titulo="Qué funciona" items={s.funciona} tono="bueno" />}
              {s.noFunciona && <Lista titulo="Qué no funciona" items={s.noFunciona} tono="malo" />}
              {s.ejemplos && s.ejemplos[0]?.critica && (
                <div className="mt-3 space-y-2">
                  {s.ejemplos.map((e, i) => (
                    <div key={i} className="rounded-xl bg-tarjeta-hover p-2 text-sm">
                      <span className="text-peligro">🌩️ {e.critica}</span>
                      <br />
                      <span className="text-exito">🌱 {e.pedido}</span>
                    </div>
                  ))}
                </div>
              )}
              {s.ejemplos && typeof s.ejemplos[0] === 'string' && (
                <Lista items={s.ejemplos} />
              )}
              {s.puntos && <Lista items={s.puntos} tono="bueno" />}
              {s.clave && <p className="mt-2 text-sm italic text-texto-2">{s.clave}</p>}
            </Acordeon>
          ))}
        </section>
      ) : (
        <section className="space-y-2">
          <h2 className="font-titulo text-lg font-bold text-texto">
            Para ti, compañero 💙
          </h2>
          <Acordeon titulo="Entrenador de Escucha" subtitulo="Escuchar ≠ Resolver" emoji="👂">
            <p className="text-sm text-texto-2">
              Cuando ella te cuenta un problema, muchas veces no busca que lo
              resuelvas: busca sentirse escuchada. Resolver de una puede sonar a
              "ya, cállate con eso".
            </p>
            <Lista
              titulo="Prueba con"
              items={[
                'Escucha completo antes de opinar.',
                'Valida lo que siente: "entiendo que te chocó".',
                'Pregunta "¿quieres que te escuche o que te ayude a resolver?".',
                'Guárdate el "deberías" para después (o nunca).',
              ]}
              tono="bueno"
            />
            <div className="mt-3 rounded-xl bg-tarjeta-hover p-3">
              <p className="text-sm font-bold text-texto">Check semanal:</p>
              <p className="text-sm text-texto-2">
                Pregúntale una vez por semana: "¿hay algo que te estás
                guardando?" — y solo escucha.
              </p>
            </div>
          </Acordeon>
          <Acordeon titulo="Anti-Roommates" subtitulo="No vuelvan compañeros de cuarto" emoji="🏚️">
            <p className="text-sm text-texto-2">
              El "nivel roommate" es cuando conviven pero dejan de conectar:
              todo es logística (cuentas, quién compra, quién cocina) y cero
              complicidad.
            </p>
            <Lista
              titulo="Señales de alerta"
              items={[
                'Solo hablan de tareas y pendientes.',
                'No hay contacto físico casual (abrazos, mano).',
                'Ya no se cuentan cómo les fue de verdad.',
                'Las citas desaparecieron del mapa.',
              ]}
              tono="malo"
            />
            <Lista
              titulo="Antídotos"
              items={[
                'Rescaten una cita semanal, aunque sea en casa.',
                'Pregunten por el día del otro con curiosidad real.',
                'Contacto físico sin agenda: un abrazo porque sí.',
                'Retomen un plan o meta juntos.',
              ]}
              tono="bueno"
            />
          </Acordeon>
        </section>
      )}

      {/* Etapas especiales (ambos) */}
      <section className="space-y-2">
        <h2 className="font-titulo text-lg font-bold text-texto">
          Etapas especiales
        </h2>
        <Acordeon titulo={GUIA_POSTPARTO.titulo} emoji="🍼">
          <p className="text-sm text-texto-2">{GUIA_POSTPARTO.intro}</p>
          <Lista items={GUIA_POSTPARTO.puntos} />
          {rol === 'el' && <Lista titulo="Para ti" items={GUIA_POSTPARTO.paraEl} tono="bueno" />}
        </Acordeon>
        <Acordeon titulo={GUIA_MENOPAUSIA.titulo} emoji="🌸">
          <p className="text-sm text-texto-2">{GUIA_MENOPAUSIA.intro}</p>
          <Lista items={GUIA_MENOPAUSIA.puntos} />
          {rol === 'el' && <Lista titulo="Para ti" items={GUIA_MENOPAUSIA.paraEl} tono="bueno" />}
        </Acordeon>
      </section>

      <p className="px-2 text-xs text-texto-3">{NOTA_MEDICA}</p>
    </div>
  )
}
