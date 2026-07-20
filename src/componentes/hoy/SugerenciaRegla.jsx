// ============================================================
// SugerenciaRegla — puente mínimo para el módulo de ciclo compartido.
//   - Modo "el": botón para avisar "creo que le vino la regla hoy".
//   - Modo "ella": si hay una sugerencia pendiente, la acepta o rechaza.
// Solo visible con Supabase configurado y pareja vinculada; no altera el
// resto de la pantalla Hoy si no aplica (retorna null).
// ============================================================
import { useEffect, useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { parejaVinculada } from '../../servicios/syncService.js'
import { supabaseConfigurado } from '../../servicios/supabaseClient.js'
import {
  sugerirRegla,
  sugerenciasPendientes,
  responderSugerencia,
} from '../../servicios/cycleShareService.js'
import { claveDia } from '../../motor/fechas.js'
import { generarId } from '../../servicios/storageService.js'

export default function SugerenciaRegla() {
  const { perfil, ciclo, actualizarCiclo } = usarApp()
  const [enviado, setEnviado] = useState(false)
  const [pendiente, setPendiente] = useState(null)
  const [cargando, setCargando] = useState(false)

  const activo = supabaseConfigurado && parejaVinculada(perfil)
  const esElla = perfil.rol === 'ella'

  useEffect(() => {
    if (!activo || !esElla) return
    let cancelado = false
    sugerenciasPendientes(perfil.userId).then((r) => {
      if (!cancelado && r.ok && r.sugerencias.length > 0) setPendiente(r.sugerencias[0])
    })
    return () => { cancelado = true }
  }, [activo, esElla, perfil.userId])

  if (!activo) return null

  async function avisar() {
    setCargando(true)
    const resultado = await sugerirRegla(perfil.coupleId, perfil.partnerId, claveDia(new Date()))
    setCargando(false)
    if (resultado.ok) setEnviado(true)
  }

  async function responder(aceptar) {
    if (!pendiente) return
    setCargando(true)
    const resultado = await responderSugerencia(pendiente.id, aceptar)
    if (resultado.ok && aceptar) {
      // Solo el cliente de la propietaria escribe el dato privado local.
      const registros = [
        ...(ciclo.registrosRegla || []),
        { id: generarId(), fechaInicio: pendiente.suggested_start_date, registradoPor: perfil.userId },
      ]
      await actualizarCiclo({ registrosRegla: registros })
    }
    setCargando(false)
    setPendiente(null)
  }

  if (!esElla) {
    if (enviado) return null
    return (
      <TarjetaBase>
        <p className="text-sm text-texto-2">
          ¿Notaste algo? Puedes avisarle con cuidado, sin tocar sus datos.
        </p>
        <button
          onClick={avisar}
          disabled={cargando}
          className="mt-2 w-full rounded-pill border border-borde py-2 text-sm font-semibold text-texto disabled:opacity-50"
        >
          {cargando ? 'Enviando…' : 'Creo que le vino la regla hoy'}
        </button>
      </TarjetaBase>
    )
  }

  if (!pendiente) return null

  return (
    <TarjetaBase>
      <p className="text-sm text-texto">
        Tu pareja sugiere que tu regla empezó el{' '}
        <strong>{pendiente.suggested_start_date}</strong>. Solo tú decides si se
        registra.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={() => responder(true)}
          disabled={cargando}
          className="rounded-pill bg-acento py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Sí, registrar
        </button>
        <button
          onClick={() => responder(false)}
          disabled={cargando}
          className="rounded-pill border border-borde py-2 text-sm font-semibold text-texto disabled:opacity-50"
        >
          No fue así
        </button>
      </div>
    </TarjetaBase>
  )
}
