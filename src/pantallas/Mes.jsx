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
import { claveDia, esFechaISOValida, fechaLarga } from '../motor/fechas.js'
import TarjetaBase from '../componentes/comunes/TarjetaBase.jsx'
import BotonGrande from '../componentes/comunes/BotonGrande.jsx'
import Calendario from '../componentes/mes/Calendario.jsx'
import RegistroSintomas from '../componentes/mes/RegistroSintomas.jsx'
import FechaDiaMesAnio from '../componentes/comunes/FechaDiaMesAnio.jsx'
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
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [fechaManual, setFechaManual] = useState('')
  const [estadoFecha, setEstadoFecha] = useState('vacia')
  const [errorFecha, setErrorFecha] = useState('')
  const [confirmarCorreccion, setConfirmarCorreccion] = useState(false)

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
  const hoy = claveDia(new Date())

  function cambiarFechaManual(valor, detalle) {
    setFechaManual(valor)
    setEstadoFecha(detalle?.estado || (valor ? 'valida' : 'vacia'))
    setErrorFecha('')
  }

  function fechaManualValida() {
    if (!fechaManual) {
      setErrorFecha(
        estadoFecha === 'invalida'
          ? 'Ingresa una fecha válida.'
          : 'Completa el día, mes y año.',
      )
      return false
    }
    if (!esFechaISOValida(fechaManual)) {
      setErrorFecha('Ingresa una fecha válida.')
      return false
    }
    if (fechaManual > hoy) {
      setErrorFecha('El primer día de la última menstruación no puede estar en el futuro.')
      return false
    }
    return true
  }

  async function prepararGuardadoManual() {
    if (!fechaManualValida()) return
    if (fechaUltima) {
      setConfirmarCorreccion(true)
      return
    }
    await aplicarFechaManual(false)
  }

  async function aplicarFechaManual(esCorreccion = true) {
    const registros = [...(ciclo.registrosRegla || [])]
    if (esCorreccion && registros.length > 0) {
      const indiceUltimo = registros.reduce((mejor, registro, indice) => {
        if (!registro.fechaInicio) return mejor
        if (mejor === -1 || registro.fechaInicio > registros[mejor].fechaInicio) return indice
        return mejor
      }, -1)
      if (indiceUltimo >= 0) {
        // Conserva el id y la autoría original; registra aparte quién corrigió.
        // En una sincronización futura, el rol ella mantiene prioridad conceptual.
        registros[indiceUltimo] = {
          ...registros[indiceUltimo],
          fechaInicio: fechaManual,
          corregidoPor: perfil.userId,
          rolCorreccion: perfil.rol,
          corregidoEl: new Date().toISOString(),
        }
      }
    } else {
      registros.push({
        id: generarId(),
        fechaInicio: fechaManual,
        registradoPor: perfil.userId,
        rolRegistro: perfil.rol,
      })
    }

    const stats = recalcularPromedio(registros)
    await actualizarCiclo({ registrosRegla: registros, ...stats })
    setConfirmarCorreccion(false)
    setEditandoFecha(false)
    setFechaManual('')
    setEstadoFecha('vacia')
    setErrorFecha('')
    setConfirmado(true)
    setTimeout(() => setConfirmado(false), 2500)
  }

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
        {!fechaUltima && (
          <p className="mb-3 font-titulo font-bold text-texto">
            Ingresa el primer día de la última menstruación
          </p>
        )}

        {fechaUltima && !editandoFecha && (
          <>
            <p className="text-center text-sm text-texto-2">
              Último inicio registrado:{' '}
              <strong className="capitalize text-texto">{fechaLarga(fechaUltima)}</strong>
            </p>
            <button
              onClick={() => {
                setFechaManual(fechaUltima)
                setEstadoFecha('valida')
                setErrorFecha('')
                setEditandoFecha(true)
              }}
              className="mt-3 w-full rounded-pill border border-borde py-2.5 text-sm font-bold text-acento"
            >
              Corregir último inicio
            </button>
          </>
        )}

        {(!fechaUltima || editandoFecha) && (
          <div className="space-y-3">
            {fechaUltima && (
              <p className="font-titulo font-bold text-texto">Corregir último inicio</p>
            )}
            <FechaDiaMesAnio
              value={fechaManual}
              onChange={cambiarFechaManual}
              max={hoy}
              error={errorFecha}
            />
            <BotonGrande className="w-full" onClick={prepararGuardadoManual}>
              {fechaUltima ? 'Revisar corrección' : 'Guardar primer día'}
            </BotonGrande>
            {editandoFecha && (
              <button
                onClick={() => {
                  setEditandoFecha(false)
                  setConfirmarCorreccion(false)
                  setErrorFecha('')
                }}
                className="w-full text-sm text-texto-3"
              >
                Cancelar
              </button>
            )}
          </div>
        )}

        {confirmarCorreccion && (
          <div className="mt-3 rounded-xl border border-alerta/50 bg-alerta/10 p-3">
            <p className="text-sm text-texto">
              ¿Confirmas que deseas reemplazar la fecha del último inicio registrado?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setConfirmarCorreccion(false)}
                className="flex-1 rounded-pill border border-borde py-2 text-sm font-bold text-texto-2"
              >
                Volver
              </button>
              <button
                onClick={() => aplicarFechaManual(true)}
                className="flex-1 rounded-pill bg-acento py-2 text-sm font-bold text-white"
              >
                Sí, corregir
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 border-t border-borde pt-3">
          {esElla ? (
            <BotonGrande variante="suave" className="w-full" onClick={registrarReglaHoy}>
              🩸 Mi regla empezó hoy
            </BotonGrande>
          ) : (
            <>
              <p className="mb-2 text-sm text-texto-2">
                Si sabes que comenzó hoy, puedes registrarlo. Ella mantiene la
                prioridad para corregir el dato.
              </p>
              <BotonGrande variante="suave" className="w-full" onClick={registrarReglaHoy}>
                🩸 Registrar “empezó hoy”
              </BotonGrande>
            </>
          )}
        </div>

        {confirmado && (
          <p className="mt-2 text-center text-sm text-exito">
            ✓ Registrado. Recalculamos el ciclo.
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
            Registra el primer día de la última menstruación para ver el calendario
            con las fases.
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
