// ============================================================
// Mes 📅 — calendario, registro de regla, predicciones y modo de fertilidad.
// En etapa menopausia se oculta el calendario y se muestra su guía + registro
// de síntomas.
// ============================================================

import { useState } from 'react'
import { usarApp } from '../contexto/AppContexto.jsx'
import { usarCiclo, ultimaRegla } from '../contexto/usarCiclo.js'
import { generarId } from '../servicios/storageService.js'
import { recalcularPromedio } from '../motor/motorCiclo.js'
import { claveDia, fechaLarga } from '../motor/fechas.js'
import TarjetaBase from '../componentes/comunes/TarjetaBase.jsx'
import BotonGrande from '../componentes/comunes/BotonGrande.jsx'
import Calendario from '../componentes/mes/Calendario.jsx'
import RegistroSintomas from '../componentes/mes/RegistroSintomas.jsx'
import {
  MODOS_FERTILIDAD,
  ETAPAS_VIDA,
  ADVERTENCIA_ANTICONCEPTIVA,
  GUIA_MENOPAUSIA,
  NOTA_MEDICA,
} from '../datos/etapasVida.js'

const PRIVACIDADES = [
  { id: 'todo', label: 'Todo' },
  { id: 'solo_fases', label: 'Solo fases' },
  { id: 'solo_alertas', label: 'Solo alertas' },
]

export default function Mes() {
  const { perfil, ciclo, actualizarCiclo, guardarPerfil } = usarApp()
  const info = usarCiclo()
  const esElla = perfil.rol === 'ella'
  const [confirmado, setConfirmado] = useState(false)

  async function registrarReglaHoy() {
    const hoy = claveDia(new Date())
    // Evita duplicar si ya se registró hoy.
    const registros = [...(ciclo.registrosRegla || [])]
    if (!registros.some((r) => r.fechaInicio === hoy)) {
      registros.push({
        id: generarId(),
        fechaInicio: hoy,
        registradoPor: perfil.userId,
        // La esposa tiene prioridad de corrección en el modelo de datos.
        rolRegistro: perfil.rol,
      })
    }
    const stats = recalcularPromedio(registros)
    await actualizarCiclo({ registrosRegla: registros, ...stats })
    setConfirmado(true)
    setTimeout(() => setConfirmado(false), 2500)
  }

  async function cambiarFertilidad(id) {
    await actualizarCiclo({ modoFertilidad: id })
  }
  async function cambiarEtapa(id) {
    await actualizarCiclo({ etapaVida: id })
  }
  async function cambiarPrivacidad(id) {
    await guardarPerfil({ ...perfil, privacidadHormonal: id })
  }

  const fechaUltima = ultimaRegla(ciclo)

  // ---------- Etapa menopausia: sin calendario ----------
  if (ciclo.etapaVida === 'menopausia') {
    return (
      <div className="animate-aparecer space-y-3">
        <h1 className="font-titulo text-2xl font-bold text-texto">Mes 📅</h1>
        <TarjetaBase>
          <p className="font-titulo text-lg font-bold text-texto">
            {GUIA_MENOPAUSIA.titulo}
          </p>
          <p className="mt-1 text-sm text-texto-2">{GUIA_MENOPAUSIA.intro}</p>
        </TarjetaBase>
        {esElla && <RegistroSintomas />}
        <SelectorEtapa etapa={ciclo.etapaVida} onCambiar={cambiarEtapa} />
        <p className="px-2 text-xs text-texto-3">{NOTA_MEDICA}</p>
      </div>
    )
  }

  return (
    <div className="animate-aparecer space-y-3">
      <h1 className="font-titulo text-2xl font-bold text-texto">Mes 📅</h1>

      {/* Registro de regla */}
      <TarjetaBase>
        {esElla ? (
          <>
            <BotonGrande className="w-full" onClick={registrarReglaHoy}>
              🩸 Mi regla empezó hoy
            </BotonGrande>
            {confirmado && (
              <p className="mt-2 text-center text-sm text-exito">
                ✓ Registrado. Recalculamos tu ciclo 💗
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mb-2 text-sm text-texto-2">
              ¿Te enteraste que empezó su regla hoy? Puedes registrarlo (ella
              tiene la última palabra para corregir).
            </p>
            <BotonGrande variante="suave" className="w-full" onClick={registrarReglaHoy}>
              🩸 Registrar "empezó hoy"
            </BotonGrande>
            {confirmado && (
              <p className="mt-2 text-center text-sm text-exito">✓ Registrado</p>
            )}
          </>
        )}
        {fechaUltima && (
          <p className="mt-2 text-center text-xs text-texto-3">
            Última regla registrada: {fechaLarga(fechaUltima)}
          </p>
        )}
      </TarjetaBase>

      {/* Aviso de baja confiabilidad */}
      {!ciclo.confiable && (
        <TarjetaBase className="border-alerta/50">
          <p className="text-sm text-texto-2">
            ⚠️ Tus últimos ciclos variaron bastante entre sí, así que las
            predicciones son solo aproximadas. Con más registros mejora la
            precisión.
          </p>
        </TarjetaBase>
      )}

      {/* Calendario */}
      {fechaUltima ? (
        <TarjetaBase>
          <Calendario
            fechaUltima={fechaUltima}
            config={ciclo}
            modoFertilidad={ciclo.modoFertilidad}
          />
        </TarjetaBase>
      ) : (
        <TarjetaBase>
          <p className="text-texto-2">
            Registra la última regla para ver el calendario con las fases.
          </p>
        </TarjetaBase>
      )}

      {/* Predicciones */}
      {info.predicciones.length > 0 && (
        <TarjetaBase>
          <p className="mb-2 font-titulo font-bold text-texto">Próximas fechas</p>
          <ul className="space-y-1 text-sm text-texto-2">
            <li>
              🩸 Próxima regla:{' '}
              <strong className="capitalize text-texto">
                {fechaLarga(info.predicciones[0].inicioRegla)}
              </strong>
              {info.diasParaProximaRegla != null &&
                info.diasParaProximaRegla >= 0 &&
                ` (en ${info.diasParaProximaRegla} días)`}
            </li>
            <li>
              ✨ Próxima ovulación:{' '}
              <span className="capitalize text-texto">
                {fechaLarga(info.predicciones[0].ovulacion)}
              </span>
            </li>
            <li>
              🩸 La siguiente:{' '}
              <span className="capitalize text-texto">
                {fechaLarga(info.predicciones[1].inicioRegla)}
              </span>
            </li>
          </ul>
        </TarjetaBase>
      )}

      {/* Modo de fertilidad */}
      <TarjetaBase>
        <p className="mb-2 font-titulo font-bold text-texto">Modo de fertilidad</p>
        <div className="grid grid-cols-2 gap-2">
          {MODOS_FERTILIDAD.map((m) => (
            <button
              key={m.id}
              onClick={() => cambiarFertilidad(m.id)}
              className={`rounded-card border-2 p-3 text-left transition-all ${
                ciclo.modoFertilidad === m.id
                  ? 'border-acento bg-tarjeta-hover'
                  : 'border-borde bg-tarjeta'
              }`}
            >
              <span className="block text-xl">{m.emoji}</span>
              <span className="block text-sm font-bold text-texto">{m.label}</span>
              <span className="text-xs text-texto-3">{m.desc}</span>
            </button>
          ))}
        </div>
        {ciclo.modoFertilidad === 'todavia_no' && (
          <p className="mt-3 rounded-xl bg-peligro/10 p-3 text-xs text-peligro">
            {ADVERTENCIA_ANTICONCEPTIVA}
          </p>
        )}
      </TarjetaBase>

      {/* Privacidad hormonal (solo ella) */}
      {esElla && (
        <TarjetaBase>
          <p className="mb-1 font-titulo font-bold text-texto">
            🔒 ¿Qué ve tu pareja?
          </p>
          <p className="mb-2 text-xs text-texto-3">Tú tienes el control.</p>
          <div className="flex gap-2">
            {PRIVACIDADES.map((p) => (
              <button
                key={p.id}
                onClick={() => cambiarPrivacidad(p.id)}
                className={`flex-1 rounded-pill border px-2 py-2 text-xs font-bold transition-all ${
                  perfil.privacidadHormonal === p.id
                    ? 'border-acento bg-acento text-white'
                    : 'border-borde bg-tarjeta text-texto-2'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </TarjetaBase>
      )}

      {/* Etapa de vida */}
      <SelectorEtapa etapa={ciclo.etapaVida} onCambiar={cambiarEtapa} />

      <p className="px-2 text-xs text-texto-3">{NOTA_MEDICA}</p>
    </div>
  )
}

function SelectorEtapa({ etapa, onCambiar }) {
  return (
    <TarjetaBase>
      <p className="mb-2 font-titulo font-bold text-texto">Etapa de vida</p>
      <div className="grid grid-cols-2 gap-2">
        {ETAPAS_VIDA.map((e) => (
          <button
            key={e.id}
            onClick={() => onCambiar(e.id)}
            className={`rounded-card border-2 p-2.5 text-left transition-all ${
              etapa === e.id ? 'border-acento bg-tarjeta-hover' : 'border-borde bg-tarjeta'
            }`}
          >
            <span className="text-lg">{e.emoji}</span>
            <span className="block text-sm font-bold text-texto">{e.label}</span>
            <span className="text-xs text-texto-3">{e.desc}</span>
          </button>
        ))}
      </div>
    </TarjetaBase>
  )
}
