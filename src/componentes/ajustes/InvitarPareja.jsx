import { useEffect, useRef } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import {
  ESTADOS_VINCULACION,
  parejaVinculada,
  vinculacionDisponible,
} from '../../servicios/syncService.js'

export default function InvitarPareja({ enfocar = false, alEnfocar }) {
  const { perfil } = usarApp()
  const seccionRef = useRef(null)
  const vinculada = parejaVinculada(perfil)
  const pendiente = perfil.estadoVinculacion === ESTADOS_VINCULACION.PENDIENTE

  useEffect(() => {
    if (!enfocar) return
    seccionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    seccionRef.current?.focus()
    alEnfocar?.()
  }, [enfocar, alEnfocar])

  return (
    <section ref={seccionRef} tabIndex={-1} aria-labelledby="titulo-vinculacion" className="outline-none">
      <TarjetaBase className={enfocar ? 'ring-2 ring-acento ring-offset-2 ring-offset-fondo' : ''}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p id="titulo-vinculacion" className="font-titulo font-bold text-texto">
            👩‍❤️‍👨 Vinculación de pareja
          </p>
          <span className="rounded-pill bg-alerta/20 px-2 py-0.5 text-xs font-bold text-alerta">
            {vinculada ? 'Vinculada' : pendiente ? 'Pendiente' : 'Próximamente'}
          </span>
        </div>

        <p className="font-semibold text-texto">
          {vinculada
            ? 'Pareja vinculada'
            : pendiente
              ? 'Vinculación pendiente'
              : 'Pareja aún no vinculada'}
        </p>
        <p className="mt-1 text-sm text-texto-2">
          La vinculación permitirá que cada uno use la app desde su celular y reciba
          las interacciones del otro.
        </p>

        {!vinculada && !vinculacionDisponible() && (
          <div className="mt-3 rounded-xl bg-tarjeta-hover p-3">
            <p className="text-sm text-texto">
              La conexión entre dos celulares todavía no está disponible en esta
              versión local.
            </p>
            <p className="mt-1 text-xs text-texto-3">
              La app ya está preparada para activarla cuando se configure el servicio
              de sincronización.
            </p>
          </div>
        )}
      </TarjetaBase>
    </section>
  )
}
