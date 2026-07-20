// ============================================================
// Más / Ajustes ⚙️ — datos y patrones + configuración completa.
//   - Datos y patrones: ánimo por fase, patrón semanal (ella), insights.
//   - Perfil: nombre, tipo de relación (celebra el upgrade), tono de humor.
//   - Preferencias: IA, gamificación, sonidos, vibración, reducir animaciones.
//   - Privacidad: PIN, ocultar contenido sensible, nombre visible de la app.
//   - Invitar pareja (próximamente) y reiniciar app.
// ============================================================

import { lazy, Suspense, useState } from 'react'
import { usarApp } from '../contexto/AppContexto.jsx'
import TarjetaBase from '../componentes/comunes/TarjetaBase.jsx'
import Toggle from '../componentes/comunes/Toggle.jsx'
import GraficoAnimoPorFase from '../componentes/ajustes/GraficoAnimoPorFase.jsx'
import PatronSemanal from '../componentes/ajustes/PatronSemanal.jsx'
import InvitarPareja from '../componentes/ajustes/InvitarPareja.jsx'

// Insights llama a la IA (Edge Function): se separa del chunk principal.
const Insights = lazy(() => import('../componentes/ajustes/Insights.jsx'))
import {
  etiquetaTipoRelacion,
  nombresNiveles,
  convivenJuntos,
} from '../datos/lenguaje.js'
import { NOTA_MEDICA } from '../datos/etapasVida.js'

const TIPOS = ['conviven', 'no_conviven']
const TONOS = [
  { id: 'suave', label: 'Suave 🌸' },
  { id: 'normal', label: 'Normal 😊' },
  { id: 'sinfiltro', label: 'Sin filtro 🔥' },
]

export default function Ajustes({ irAGuia, seccionObjetivo, alConsumirObjetivo }) {
  const {
    perfil,
    config,
    guardarPerfil,
    actualizarConfig,
    reiniciarApp,
  } = usarApp()
  const esElla = perfil.rol === 'ella'
  const [celebraUpgrade, setCelebraUpgrade] = useState(false)
  const [confirmarReinicio, setConfirmarReinicio] = useState(false)

  async function cambiarTipo(nuevo) {
    // Si pasan de no convivir a convivir, se celebra el nuevo capítulo.
    const noConvivianAntes = convivenJuntos(perfil.tipoRelacion) === false
    const empiezanAConvivir = noConvivianAntes && nuevo === 'conviven'
    await guardarPerfil({ ...perfil, tipoRelacion: nuevo })
    if (empiezanAConvivir) {
      setCelebraUpgrade(true)
      setTimeout(() => setCelebraUpgrade(false), 4000)
    }
  }

  const nombresNiv = nombresNiveles(perfil.rol, perfil.tipoRelacion)

  return (
    <div className="animate-aparecer space-y-4">
      <h1 className="font-titulo text-2xl font-bold text-texto">Más ⚙️</h1>

      {celebraUpgrade && (
        <div className="animate-aparecer rounded-card bg-acento/15 p-4 text-center">
          <p className="text-3xl">🏠🎉</p>
          <p className="font-titulo font-bold text-texto">¡Ahora viven juntos!</p>
          <p className="text-sm text-texto-2">
            Se desbloquearon nuevas misiones para compartir el día a día 💫
          </p>
        </div>
      )}

      {/* ---------- Acceso a la Guía ---------- */}
      {irAGuia && (
        <button
          onClick={irAGuia}
          className="w-full rounded-card bg-acento/10 p-4 text-left transition-transform active:scale-[0.99]"
        >
          <p className="font-titulo font-bold text-texto">📖 Guía de la relación</p>
          <p className="text-sm text-texto-2">
            Fases del ciclo, herramientas y manuales para entenderse mejor.
          </p>
        </button>
      )}

      {/* ---------- Datos y patrones ---------- */}
      <section className="space-y-3">
        <h2 className="font-titulo text-lg font-bold text-texto">Datos y patrones</h2>
        <GraficoAnimoPorFase />
        {esElla && <PatronSemanal />}
        <Suspense fallback={null}>
          <Insights />
        </Suspense>
      </section>

      {/* ---------- Perfil ---------- */}
      <section className="space-y-3">
        <h2 className="font-titulo text-lg font-bold text-texto">Tu perfil</h2>
        <TarjetaBase>
          <label className="text-sm font-semibold text-texto">Tu nombre</label>
          <input
            value={perfil.nombre || ''}
            onChange={(e) => guardarPerfil({ ...perfil, nombre: e.target.value })}
            placeholder="¿Cómo te llamas?"
            className="mt-1 w-full rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
          />
        </TarjetaBase>

        <TarjetaBase>
          <p className="mb-2 text-sm font-semibold text-texto">
            ¿Viven juntos? · {etiquetaTipoRelacion(perfil.tipoRelacion)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map((t) => (
              <button
                key={t}
                onClick={() => cambiarTipo(t)}
                className={`rounded-pill border px-2 py-2 text-xs font-bold transition-all ${
                  perfil.tipoRelacion === t
                    ? 'border-acento bg-acento text-white'
                    : 'border-borde text-texto-2'
                }`}
              >
                {etiquetaTipoRelacion(t)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-texto-3">
            Nivel máximo: 🏆 {nombresNiv[3]}
          </p>
        </TarjetaBase>

        <TarjetaBase>
          <p className="mb-2 text-sm font-semibold text-texto">Tono de humor</p>
          <div className="grid grid-cols-3 gap-2">
            {TONOS.map((t) => (
              <button
                key={t.id}
                onClick={() => guardarPerfil({ ...perfil, tonoHumor: t.id })}
                className={`rounded-pill border px-2 py-2 text-xs font-bold transition-all ${
                  perfil.tonoHumor === t.id
                    ? 'border-acento bg-acento text-white'
                    : 'border-borde text-texto-2'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </TarjetaBase>
      </section>

      {/* ---------- Preferencias ---------- */}
      <section className="space-y-3">
        <h2 className="font-titulo text-lg font-bold text-texto">Preferencias</h2>
        <TarjetaBase className="divide-y divide-borde">
          <Toggle
            emoji="🤖"
            etiqueta="Funciones con IA"
            descripcion="Si la apagas, todo sigue funcionando con respuestas listas."
            activo={config.iaActiva}
            onCambiar={(v) => actualizarConfig({ iaActiva: v })}
          />
          <Toggle
            emoji="🎮"
            etiqueta="Gamificación"
            descripcion="Puntos, niveles y logros. Puedes apagarla sin perder la comunicación."
            activo={config.gamificacionActiva}
            onCambiar={(v) => actualizarConfig({ gamificacionActiva: v })}
          />
          <Toggle
            emoji="🔊"
            etiqueta="Sonidos"
            activo={config.sonidos}
            onCambiar={(v) => actualizarConfig({ sonidos: v })}
          />
          <Toggle
            emoji="📳"
            etiqueta="Vibración"
            activo={config.vibracion}
            onCambiar={(v) => actualizarConfig({ vibracion: v })}
          />
          <Toggle
            emoji="🎬"
            etiqueta="Reducir animaciones"
            descripcion="Menos movimiento en pantalla."
            activo={config.reducirMovimiento}
            onCambiar={(v) => actualizarConfig({ reducirMovimiento: v })}
          />
        </TarjetaBase>
      </section>

      {/* ---------- Privacidad ---------- */}
      <section className="space-y-3">
        <h2 className="font-titulo text-lg font-bold text-texto">Privacidad</h2>
        <TarjetaBase className="space-y-2">
          <Toggle
            emoji="🔔"
            etiqueta="Mostrar contenido sensible en notificaciones"
            descripcion="Si lo apagas, las notificaciones nunca mencionan el ciclo."
            activo={config.notifSensibles}
            onCambiar={(v) => actualizarConfig({ notifSensibles: v })}
          />
          <div className="border-t border-borde pt-2">
            <label className="text-sm font-semibold text-texto">
              PIN de bloqueo (4 dígitos)
            </label>
            <input
              inputMode="numeric"
              maxLength={4}
              value={config.pin || ''}
              onChange={(e) =>
                actualizarConfig({ pin: e.target.value.replace(/\D/g, '').slice(0, 4) || null })
              }
              placeholder="Sin PIN"
              className="mt-1 w-full rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
            />
            <p className="mt-1 text-xs text-texto-3">
              Deja vacío para no usar PIN. Se pedirá al abrir la app.
            </p>
          </div>
          <div className="border-t border-borde pt-2">
            <label className="text-sm font-semibold text-texto">
              Nombre visible de la app
            </label>
            <input
              value={config.nombreApp || ''}
              onChange={(e) => actualizarConfig({ nombreApp: e.target.value })}
              placeholder="Conecta2"
              className="mt-1 w-full rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
            />
            <p className="mt-1 text-xs text-texto-3">
              Un nombre discreto para el ícono en tu celular.
            </p>
          </div>
        </TarjetaBase>
      </section>

      {/* ---------- Pareja ---------- */}
      <InvitarPareja
        enfocar={seccionObjetivo === 'pareja'}
        alEnfocar={alConsumirObjetivo}
      />

      {/* ---------- Reiniciar ---------- */}
      <section className="space-y-2">
        {!confirmarReinicio ? (
          <button
            onClick={() => setConfirmarReinicio(true)}
            className="w-full rounded-pill border border-peligro/50 py-2.5 text-sm font-bold text-peligro"
          >
            Reiniciar la app (borra todo)
          </button>
        ) : (
          <TarjetaBase className="border-peligro/50">
            <p className="text-sm text-texto">
              ¿Seguro? Se borrarán todos los datos de este celular. Esto no se
              puede deshacer.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setConfirmarReinicio(false)}
                className="flex-1 rounded-pill border border-borde py-2 text-sm font-bold text-texto-2"
              >
                Cancelar
              </button>
              <button
                onClick={reiniciarApp}
                className="flex-1 rounded-pill bg-peligro py-2 text-sm font-bold text-white"
              >
                Sí, borrar todo
              </button>
            </div>
          </TarjetaBase>
        )}
      </section>

      <p className="px-2 text-center text-xs text-texto-3">
        {NOTA_MEDICA}
        <br />
        Conecta2 · hecho con 💙💗
      </p>
    </div>
  )
}
