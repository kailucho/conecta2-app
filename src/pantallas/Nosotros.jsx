// ============================================================
// Nosotros 💑 — espacio compartido de la pareja.
// Conexión de hoy, termómetro, cita semanal, metas, lista de deseos, patrones
// (ánimo observado de la pareja) y detector de manías. Igual para ambos roles.
// ============================================================

import { usarCiclo } from '../contexto/usarCiclo.js'
import ConexionHoy from '../componentes/transversales/ConexionHoy.jsx'
import Termometro from '../componentes/nosotros/Termometro.jsx'
import Citas from '../componentes/nosotros/Citas.jsx'
import Metas from '../componentes/nosotros/Metas.jsx'
import Deseos from '../componentes/nosotros/Deseos.jsx'
import DetectorManias from '../componentes/nosotros/DetectorManias.jsx'
import RegistroAnimoObservado from '../componentes/hoy/RegistroAnimoObservado.jsx'

export default function Nosotros() {
  const ciclo = usarCiclo()

  return (
    <div className="animate-aparecer space-y-3">
      <h1 className="font-titulo text-2xl font-bold text-texto">Nosotros 💑</h1>
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
