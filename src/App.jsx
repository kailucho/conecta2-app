// ============================================================
// App — raíz de la interfaz.
// - Aplica el tema visual (data-tema) según el rol del perfil.
// - Si no hay perfil, muestra el Onboarding.
// - Si hay perfil, muestra las 5 pestañas + overlay de SOS.
// ============================================================

import { lazy, Suspense, useEffect, useState } from 'react'
import { usarApp } from './contexto/AppContexto.jsx'
import { usarCiclo } from './contexto/usarCiclo.js'
import { pronosticoDelDia } from './motor/pronosticoPareja.js'
import { mostrarResumenMatutinoSiCorresponde } from './servicios/notificaciones.js'
import NavegacionInferior from './componentes/comunes/NavegacionInferior.jsx'
import Onboarding from './pantallas/Onboarding.jsx'
import Hoy from './pantallas/Hoy.jsx'
import Mes from './pantallas/Mes.jsx'
import Nosotros from './pantallas/Nosotros.jsx'
import Ajustes from './pantallas/Ajustes.jsx'
import BloqueoPIN from './componentes/comunes/BloqueoPIN.jsx'
import ParejaRequerida from './componentes/vinculacion/ParejaRequerida.jsx'

// Guía (Traductor/Generador de mensajes con IA) y el flujo de SOS (Chat con
// IA) solo se visitan a veces: se separan del chunk principal.
const Guia = lazy(() => import('./pantallas/Guia.jsx'))
const FlujoSOS = lazy(() => import('./componentes/sos/FlujoSOS.jsx'))

function CargandoPantalla() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="animate-[destello_1.2s_ease-in-out_infinite] text-3xl">💙💗</div>
    </div>
  )
}

export default function App() {
  const {
    cargando,
    perfil,
    config,
    interacciones,
    actualizarConfig,
    solicitudVinculacion,
    errorInteraccion,
    cerrarSolicitudVinculacion,
    limpiarErrorInteraccion,
  } = usarApp()
  const ciclo = usarCiclo()
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

  // Resumen matutino (Nivel 1: solo con la app abierta, una vez por fecha).
  useEffect(() => {
    if (!perfil || !config.resumenMatutino?.activo) return
    const pronosticoHoy = pronosticoDelDia(new Date(), {
      ciclo,
      fechaUltimaRegla: ciclo.fechaUltima,
      interacciones,
      userId: perfil.userId,
      partnerId: perfil.partnerId,
      privacidadHormonal: perfil.privacidadHormonal,
    })
    mostrarResumenMatutinoSiCorresponde(pronosticoHoy, config.resumenMatutino, (nuevo) =>
      actualizarConfig({ resumenMatutino: nuevo }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil, config.resumenMatutino?.activo, config.resumenMatutino?.ultimaFecha])

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
    guia: (
      <Suspense fallback={<CargandoPantalla />}>
        <Guia alVolver={() => setPestana('ajustes')} />
      </Suspense>
    ),
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

      {sosAbierto && (
        <Suspense fallback={<CargandoPantalla />}>
          <FlujoSOS alCerrar={() => setSosAbierto(false)} />
        </Suspense>
      )}

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
