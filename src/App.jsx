// ============================================================
// App — raíz de la interfaz.
// - Aplica el tema visual (data-tema) según el rol del perfil.
// - Si no hay perfil, muestra el Onboarding.
// - Si hay perfil, muestra las 5 pestañas + overlay de SOS.
// ============================================================

import { useEffect, useState } from 'react'
import { usarApp } from './contexto/AppContexto.jsx'
import NavegacionInferior from './componentes/comunes/NavegacionInferior.jsx'
import Onboarding from './pantallas/Onboarding.jsx'
import Hoy from './pantallas/Hoy.jsx'
import Mes from './pantallas/Mes.jsx'
import Guia from './pantallas/Guia.jsx'
import Nosotros from './pantallas/Nosotros.jsx'
import Ajustes from './pantallas/Ajustes.jsx'
import FlujoSOS from './componentes/sos/FlujoSOS.jsx'
import BloqueoPIN from './componentes/comunes/BloqueoPIN.jsx'
import ParejaRequerida from './componentes/vinculacion/ParejaRequerida.jsx'

export default function App() {
  const {
    cargando,
    perfil,
    config,
    solicitudVinculacion,
    errorInteraccion,
    cerrarSolicitudVinculacion,
    limpiarErrorInteraccion,
  } = usarApp()
  const [pestana, setPestana] = useState('hoy')
  const [seccionAjustes, setSeccionAjustes] = useState(null)
  const [sosAbierto, setSosAbierto] = useState(false)
  // Bloqueo por PIN: arranca bloqueado si hay PIN configurado.
  const [desbloqueado, setDesbloqueado] = useState(false)

  // Aplica el tema (rol) y la preferencia de reducir movimiento al <html>.
  useEffect(() => {
    const html = document.documentElement
    if (perfil?.rol) {
      html.setAttribute('data-tema', perfil.rol)
      // theme-color de la barra del navegador según el rol.
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) {
        meta.setAttribute('content', perfil.rol === 'ella' ? '#fff1f5' : '#071827')
      }
    }
    html.classList.toggle('reducir-movimiento', !!config.reducirMovimiento)
  }, [perfil?.rol, config.reducirMovimiento])

  if (cargando) {
    return (
      <div className="fondo-app flex min-h-screen items-center justify-center">
        <div className="animate-[destello_1.2s_ease-in-out_infinite] text-4xl">
          💙💗
        </div>
      </div>
    )
  }

  // Falta onboarding.
  if (!perfil) {
    return <Onboarding />
  }

  // Bloqueo por PIN (si está configurado y aún no se desbloqueó).
  if (config.pin && config.pin.length === 4 && !desbloqueado) {
    return (
      <BloqueoPIN
        pin={config.pin}
        nombreApp={config.nombreApp}
        onDesbloquear={() => setDesbloqueado(true)}
      />
    )
  }

  const PANTALLAS = {
    hoy: <Hoy abrirSOS={() => setSosAbierto(true)} irA={setPestana} />,
    mes: <Mes />,
    guia: <Guia alVolver={() => setPestana('ajustes')} />,
    nosotros: <Nosotros />,
    ajustes: (
      <Ajustes
        irAGuia={() => setPestana('guia')}
        seccionObjetivo={seccionAjustes}
        alConsumirObjetivo={() => setSeccionAjustes(null)}
      />
    ),
  }

  // La Guía se muestra desde "Más": resalta esa pestaña mientras se navega.
  const pestanaActiva = pestana === 'guia' ? 'ajustes' : pestana

  return (
    <div className="fondo-app min-h-screen">
      <main className="mx-auto max-w-lg px-4 pb-44 pt-4 area-segura-arriba">
        {PANTALLAS[pestana]}
      </main>

      <NavegacionInferior activa={pestanaActiva} alCambiar={setPestana} />

      {sosAbierto && <FlujoSOS alCerrar={() => setSosAbierto(false)} />}

      <ParejaRequerida
        abierto={!!solicitudVinculacion || !!errorInteraccion}
        motivo={errorInteraccion || 'sin_pareja_vinculada'}
        alCerrar={() => {
          cerrarSolicitudVinculacion()
          limpiarErrorInteraccion()
        }}
        alIrAVinculacion={() => {
          cerrarSolicitudVinculacion()
          setSosAbierto(false)
          setPestana('ajustes')
          setSeccionAjustes('pareja')
        }}
      />
    </div>
  )
}
