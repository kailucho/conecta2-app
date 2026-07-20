// Centro de Conexión — nivel, progreso y logros. Mensajería SIEMPRE positiva.
// La gamificación se puede desactivar en Ajustes sin perder la comunicación.
import ModalHoja from '../comunes/ModalHoja.jsx'
import BarraProgreso from '../comunes/BarraProgreso.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import {
  calcularNivel,
  progresoNivel,
  faltanParaSubir,
} from '../../motor/gamificacion.js'
import { nombresNiveles } from '../../datos/lenguaje.js'
import { LOGROS, evaluarLogros } from '../../datos/logros.js'

const EMOJIS_NIVEL = ['🌱', '📘', '⭐', '🏆']

export default function CentroConexion({ abierto, alCerrar }) {
  const app = usarApp()
  const { perfil, gamificacion } = app

  const nivel = calcularNivel(gamificacion.puntos)
  const nombres = nombresNiveles(perfil.rol, perfil.tipoRelacion)
  const progreso = progresoNivel(gamificacion.puntos)
  const faltan = faltanParaSubir(gamificacion.puntos)

  // Logros desbloqueados según el estado actual.
  const desbloqueados = new Set(
    evaluarLogros({
      gamificacion,
      interacciones: app.interacciones,
      nosotros: app.nosotros,
      sos: app.sos,
    }),
  )

  return (
    <ModalHoja abierto={abierto} alCerrar={alCerrar} titulo="Centro de Conexión 🎮">
      <div className="space-y-4">
        {/* Nivel actual */}
        <div className="rounded-card bg-tarjeta-hover p-4 text-center">
          <div className="text-4xl">{EMOJIS_NIVEL[nivel]}</div>
          <p className="mt-1 font-titulo text-xl font-bold text-texto">
            {nombres[nivel]}
          </p>
          <p className="text-sm text-texto-3">{gamificacion.puntos} puntos de conexión</p>
          <div className="mt-3">
            <BarraProgreso valor={progreso * 100} max={100} />
            {faltan != null ? (
              <p className="mt-1 text-xs text-texto-3">
                Faltan {faltan} para {nombres[nivel + 1]}
              </p>
            ) : (
              <p className="mt-1 text-xs text-exito">¡Nivel máximo! Leyendas 💫</p>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-texto-2">
          Esto no es una competencia. Cada punto es un momentito de cuidarse 💙
        </p>

        {/* Logros */}
        <div>
          <p className="mb-2 font-titulo font-bold text-texto">Logros</p>
          <div className="grid grid-cols-2 gap-2">
            {LOGROS.map((l) => {
              const ok = desbloqueados.has(l.id)
              return (
                <div
                  key={l.id}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    ok
                      ? 'border-acento bg-tarjeta-hover'
                      : 'border-borde bg-tarjeta opacity-50'
                  }`}
                >
                  <div className="text-2xl">{ok ? l.emoji : '🔒'}</div>
                  <p className="mt-1 text-xs font-bold text-texto">{l.titulo}</p>
                  <p className="text-[11px] text-texto-3">{l.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ModalHoja>
  )
}
