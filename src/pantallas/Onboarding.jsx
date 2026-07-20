// ============================================================
// Onboarding — configuración inicial mínima.
// Flujo: bienvenida → rol → tipo de relación → fecha última regla →
//        tono de humor → (solo ella) privacidad hormonal → instalar PWA.
//
// El tema visual se aplica EN VIVO apenas se elige el rol (efecto espejo).
// Solo se piden los datos imprescindibles; el resto se pide luego en contexto.
// ============================================================

import { useEffect, useState } from 'react'
import { usarApp } from '../contexto/AppContexto.jsx'
import { generarId } from '../servicios/storageService.js'
import { recalcularPromedio } from '../motor/motorCiclo.js'
import { claveDia } from '../motor/fechas.js'
import { comoLlamarPareja } from '../datos/lenguaje.js'
import { puedeInstalar, instalar, estaInstalada } from '../servicios/instalacionPWA.js'
import { pedirPermiso } from '../servicios/notificaciones.js'
import BotonGrande from '../componentes/comunes/BotonGrande.jsx'

const TIPOS_RELACION = [
  { id: 'casados', emoji: '💍', label: 'Casados', desc: 'Experiencia completa' },
  { id: 'convivientes', emoji: '🏠', label: 'Convivientes', desc: 'Viven juntos' },
  { id: 'novios', emoji: '💌', label: 'Enamorados', desc: 'Novios que no conviven' },
]

const TONOS = [
  { id: 'suave', emoji: '🌸', label: 'Suave', desc: 'Cariñoso y delicado' },
  { id: 'normal', emoji: '😊', label: 'Normal', desc: 'Divertido y directo' },
  { id: 'sinfiltro', emoji: '🔥', label: 'Sin filtro', desc: 'Humor sin pelos en la lengua' },
]

const PRIVACIDADES = [
  { id: 'todo', label: 'Todo', desc: 'Tu pareja ve fases y alertas' },
  { id: 'solo_fases', label: 'Solo fases', desc: 'Ve la fase, no los detalles' },
  { id: 'solo_alertas', label: 'Solo alertas', desc: 'Solo lo que tú le avises' },
]

export default function Onboarding() {
  const { guardarPerfil, actualizarCiclo } = usarApp()
  const [paso, setPaso] = useState(0)
  const [rol, setRol] = useState(null)
  const [tipoRelacion, setTipoRelacion] = useState(null)
  const [fechaRegla, setFechaRegla] = useState('')
  const [tono, setTono] = useState('normal')
  const [privacidad, setPrivacidad] = useState('todo')

  // Aplica el tema en vivo apenas se elige el rol (efecto espejo).
  useEffect(() => {
    if (rol) document.documentElement.setAttribute('data-tema', rol)
  }, [rol])

  // Fecha de hoy en formato input date, como tope máximo.
  const hoyStr = claveDia(new Date())

  async function finalizar() {
    const userId = generarId()
    const perfil = {
      userId,
      coupleId: generarId(), // se reconciliará al vincular en Fase 2
      partnerId: generarId(), // placeholder de la pareja
      rol,
      tipoRelacion,
      nombre: '',
      tonoHumor: tono,
      privacidadHormonal: rol === 'ella' ? privacidad : 'todo',
      nubarronDebil: null,
      creadoEl: new Date().toISOString(),
    }

    // Registro inicial de regla (si la ingresó).
    const registros = fechaRegla
      ? [{ id: generarId(), fechaInicio: fechaRegla, registradoPor: userId }]
      : []
    const stats = recalcularPromedio(registros)

    await actualizarCiclo({
      registrosRegla: registros,
      ...stats,
    })
    await guardarPerfil(perfil)

    // Pide permiso de notificaciones amablemente al terminar.
    pedirPermiso()
  }

  const total = rol === 'ella' ? 6 : 5

  return (
    <div className="fondo-app flex min-h-screen flex-col px-6 pb-10 pt-12 area-segura-arriba">
      {/* Barra de progreso de pasos */}
      {paso > 0 && (
        <div className="mb-8 flex gap-1.5">
          {Array.from({ length: total - 1 }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < paso ? 'bg-acento' : 'bg-borde'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center">
        {/* ---------- Paso 0: Bienvenida ---------- */}
        {paso === 0 && (
          <div className="animate-aparecer text-center">
            <div className="mb-6 text-6xl">💙💗</div>
            <h1 className="mb-3 font-titulo text-3xl font-extrabold text-texto">
              Modo Pareja
            </h1>
            <p className="mx-auto mb-10 max-w-xs text-texto-2">
              Una app para entenderse mejor, cuidarse y estar más conectados.
              Vamos a configurarla en un minuto 💫
            </p>
            <BotonGrande className="w-full" onClick={() => setPaso(1)}>
              Empezar
            </BotonGrande>
          </div>
        )}

        {/* ---------- Paso 1: Rol ---------- */}
        {paso === 1 && (
          <div className="animate-aparecer">
            <h2 className="mb-2 font-titulo text-2xl font-bold text-texto">
              ¿Quién eres tú?
            </h2>
            <p className="mb-8 text-texto-2">
              Esto define el estilo y el contenido de tu app.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRol('el')}
                className={`flex flex-col items-center gap-2 rounded-card border-2 p-6 transition-all ${
                  rol === 'el'
                    ? 'border-acento bg-tarjeta-hover scale-[1.02]'
                    : 'border-borde bg-tarjeta'
                }`}
              >
                <span className="text-5xl">💙</span>
                <span className="font-titulo font-bold text-texto">Él</span>
                <span className="text-xs text-texto-3">Novio / Esposo</span>
              </button>
              <button
                onClick={() => setRol('ella')}
                className={`flex flex-col items-center gap-2 rounded-card border-2 p-6 transition-all ${
                  rol === 'ella'
                    ? 'border-acento bg-tarjeta-hover scale-[1.02]'
                    : 'border-borde bg-tarjeta'
                }`}
              >
                <span className="text-5xl">💗</span>
                <span className="font-titulo font-bold text-texto">Ella</span>
                <span className="text-xs text-texto-3">Novia / Esposa</span>
              </button>
            </div>
            <BotonGrande
              className="mt-8 w-full"
              disabled={!rol}
              onClick={() => setPaso(2)}
            >
              Continuar
            </BotonGrande>
          </div>
        )}

        {/* ---------- Paso 2: Tipo de relación ---------- */}
        {paso === 2 && (
          <div className="animate-aparecer">
            <h2 className="mb-2 font-titulo text-2xl font-bold text-texto">
              ¿Cómo es su relación?
            </h2>
            <p className="mb-8 text-texto-2">
              Adaptamos el contenido a su situación. Lo puedes cambiar después.
            </p>
            <div className="space-y-3">
              {TIPOS_RELACION.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTipoRelacion(t.id)}
                  className={`flex w-full items-center gap-4 rounded-card border-2 p-4 text-left transition-all ${
                    tipoRelacion === t.id
                      ? 'border-acento bg-tarjeta-hover'
                      : 'border-borde bg-tarjeta'
                  }`}
                >
                  <span className="text-3xl">{t.emoji}</span>
                  <span>
                    <span className="block font-titulo font-bold text-texto">
                      {t.label}
                    </span>
                    <span className="text-sm text-texto-3">{t.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            <BotonGrande
              className="mt-8 w-full"
              disabled={!tipoRelacion}
              onClick={() => setPaso(3)}
            >
              Continuar
            </BotonGrande>
          </div>
        )}

        {/* ---------- Paso 3: Fecha última regla ---------- */}
        {paso === 3 && (
          <div className="animate-aparecer">
            <h2 className="mb-2 font-titulo text-2xl font-bold text-texto">
              {rol === 'ella'
                ? '¿Cuándo empezó tu última regla?'
                : `¿Cuándo fue la última regla de ${comoLlamarPareja(rol, tipoRelacion)}?`}
            </h2>
            <p className="mb-8 text-texto-2">
              Con esto calculamos las fases del ciclo. Si no lo sabes con
              exactitud, un aproximado está bien; se ajusta con el tiempo.
            </p>
            <input
              type="date"
              value={fechaRegla}
              max={hoyStr}
              onChange={(e) => setFechaRegla(e.target.value)}
              className="w-full rounded-card border border-borde bg-tarjeta p-4 text-lg text-texto"
            />
            <button
              onClick={() => setPaso(4)}
              className="mt-4 text-sm text-texto-3 underline"
            >
              No lo sé ahora, lo pongo después
            </button>
            <BotonGrande
              className="mt-6 w-full"
              disabled={!fechaRegla}
              onClick={() => setPaso(4)}
            >
              Continuar
            </BotonGrande>
          </div>
        )}

        {/* ---------- Paso 4: Tono de humor ---------- */}
        {paso === 4 && (
          <div className="animate-aparecer">
            <h2 className="mb-2 font-titulo text-2xl font-bold text-texto">
              ¿Qué tono de humor prefieres?
            </h2>
            <p className="mb-8 text-texto-2">
              Así ajustamos el estilo de los mensajes y tips.
            </p>
            <div className="space-y-3">
              {TONOS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTono(t.id)}
                  className={`flex w-full items-center gap-4 rounded-card border-2 p-4 text-left transition-all ${
                    tono === t.id
                      ? 'border-acento bg-tarjeta-hover'
                      : 'border-borde bg-tarjeta'
                  }`}
                >
                  <span className="text-3xl">{t.emoji}</span>
                  <span>
                    <span className="block font-titulo font-bold text-texto">
                      {t.label}
                    </span>
                    <span className="text-sm text-texto-3">{t.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            <BotonGrande
              className="mt-8 w-full"
              onClick={() => setPaso(rol === 'ella' ? 5 : 6)}
            >
              Continuar
            </BotonGrande>
          </div>
        )}

        {/* ---------- Paso 5: Privacidad hormonal (solo ella) ---------- */}
        {paso === 5 && rol === 'ella' && (
          <div className="animate-aparecer">
            <h2 className="mb-2 font-titulo text-2xl font-bold text-texto">
              Tu privacidad 🔒
            </h2>
            <p className="mb-8 text-texto-2">
              ¿Qué quieres que tu pareja pueda ver de tu ciclo? Tú tienes el
              control y lo puedes cambiar cuando quieras.
            </p>
            <div className="space-y-3">
              {PRIVACIDADES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPrivacidad(p.id)}
                  className={`flex w-full items-center justify-between rounded-card border-2 p-4 text-left transition-all ${
                    privacidad === p.id
                      ? 'border-acento bg-tarjeta-hover'
                      : 'border-borde bg-tarjeta'
                  }`}
                >
                  <span>
                    <span className="block font-titulo font-bold text-texto">
                      {p.label}
                    </span>
                    <span className="text-sm text-texto-3">{p.desc}</span>
                  </span>
                  {privacidad === p.id && <span className="text-acento">✓</span>}
                </button>
              ))}
            </div>
            <BotonGrande className="mt-8 w-full" onClick={() => setPaso(6)}>
              Continuar
            </BotonGrande>
          </div>
        )}

        {/* ---------- Paso 6: Instalar / Finalizar ---------- */}
        {paso === 6 && (
          <PasoFinal
            rol={rol}
            onListo={finalizar}
          />
        )}
      </div>

      {/* Botón atrás discreto */}
      {paso > 1 && paso < 6 && (
        <button
          onClick={() => setPaso((p) => (p === 6 && rol !== 'ella' ? 4 : p - 1))}
          className="mt-4 self-center text-sm text-texto-3"
        >
          ← Atrás
        </button>
      )}
    </div>
  )
}

// Último paso: ofrece instalar la PWA y confirma.
function PasoFinal({ rol, onListo }) {
  const [instalando, setInstalando] = useState(false)
  const mostrarInstalar = puedeInstalar() && !estaInstalada()

  async function instalarApp() {
    setInstalando(true)
    await instalar()
    setInstalando(false)
  }

  return (
    <div className="animate-aparecer text-center">
      <div className="mb-6 text-6xl">{rol === 'ella' ? '💗✨' : '💙✨'}</div>
      <h2 className="mb-3 font-titulo text-2xl font-bold text-texto">
        ¡Todo listo!
      </h2>
      <p className="mx-auto mb-8 max-w-xs text-texto-2">
        Ya puedes empezar. Si instalas la app en tu celular, la abres como
        cualquier otra y funciona sin internet.
      </p>

      {mostrarInstalar && (
        <BotonGrande
          variante="suave"
          className="mb-3 w-full"
          disabled={instalando}
          onClick={instalarApp}
        >
          📲 Agregar a pantalla de inicio
        </BotonGrande>
      )}

      <BotonGrande className="w-full" onClick={onListo}>
        Entrar a la app
      </BotonGrande>

      <p className="mt-6 text-xs text-texto-3">
        Esta app acompaña, no reemplaza consejo médico ni terapia profesional.
      </p>
    </div>
  )
}
