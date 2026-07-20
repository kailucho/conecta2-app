// Invitar pareja — muestra el código de pareja como "próximamente" (Fase 2).
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { generarCodigoInvitacion, pendientesDeSync } from '../../servicios/syncService.js'
import { useEffect, useState } from 'react'

export default function InvitarPareja() {
  const { perfil } = usarApp()
  const codigo = generarCodigoInvitacion(perfil.coupleId)
  const [pendientes, setPendientes] = useState(0)

  useEffect(() => {
    pendientesDeSync().then(setPendientes)
  }, [])

  return (
    <TarjetaBase>
      <div className="mb-1 flex items-center justify-between">
        <p className="font-titulo font-bold text-texto">👫 Invitar a tu pareja</p>
        <span className="rounded-pill bg-alerta/20 px-2 py-0.5 text-xs font-bold text-alerta">
          Próximamente
        </span>
      </div>
      <p className="text-sm text-texto-2">
        Pronto vas a poder vincular tu cuenta con la de tu pareja para que se
        envíen todo en tiempo real, cada uno desde su celular.
      </p>
      <div className="mt-3 rounded-xl bg-tarjeta-hover p-3 text-center">
        <p className="text-xs text-texto-3">Tu código de pareja</p>
        <p className="font-titulo text-2xl font-extrabold tracking-widest text-acento">
          {codigo}
        </p>
      </div>
      {pendientes > 0 && (
        <p className="mt-2 text-xs text-texto-3">
          Tienes {pendientes} {pendientes === 1 ? 'mensaje' : 'mensajes'} guardado
          {pendientes === 1 ? '' : 's'} que se enviará
          {pendientes === 1 ? '' : 'n'} cuando se vinculen 📤
        </p>
      )}
    </TarjetaBase>
  )
}
