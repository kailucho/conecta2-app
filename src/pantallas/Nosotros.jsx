// ============================================================
// Nosotros 💑 — espacio compartido de la pareja.
// Conexión de hoy, termómetro, cita semanal, metas, lista de deseos, patrones
// (ánimo observado de la pareja) y detector de manías. Igual para ambos roles.
// ============================================================

import { usarApp } from '../contexto/AppContexto.jsx'
import { usarCiclo } from '../contexto/usarCiclo.js'
import { parejaVinculada } from '../servicios/syncService.js'
import TarjetaBase from '../componentes/comunes/TarjetaBase.jsx'
import ConexionHoy from '../componentes/transversales/ConexionHoy.jsx'
import Termometro from '../componentes/nosotros/Termometro.jsx'
import Citas from '../componentes/nosotros/Citas.jsx'
import Metas from '../componentes/nosotros/Metas.jsx'
import Deseos from '../componentes/nosotros/Deseos.jsx'
import DetectorManias from '../componentes/nosotros/DetectorManias.jsx'
import RegistroAnimoObservado from '../componentes/hoy/RegistroAnimoObservado.jsx'

export default function Nosotros() {
  const { perfil } = usarApp()
  const ciclo = usarCiclo()
  const vinculada = parejaVinculada(perfil)

  return (
    <div className="animate-aparecer space-y-3">
      <h1 className="font-titulo text-2xl font-bold text-texto">Conexión 💑</h1>

      <TarjetaBase>
        <p className="text-sm text-texto-2">
          {vinculada
            ? 'Están conectados. Pueden compartir estados e interacciones dentro de Conecta2.'
            : 'Puedes usar Conecta2 y comunicarte por WhatsApp. Vincular a tu pareja es opcional.'}
        </p>
      </TarjetaBase>

      <ConexionHoy />
      <Termometro />
      <Citas />
      <Metas />
      <Deseos />

      {/* Patrones: registro del ánimo observado de la pareja (antes en Hoy). */}
      <section className="space-y-2">
        <h2 className="font-titulo text-lg font-bold text-texto">Patrones</h2>
        <RegistroAnimoObservado dia={ciclo.dia} faseId={ciclo.fase?.id} />
      </section>

      <DetectorManias />
    </div>
  )
}
