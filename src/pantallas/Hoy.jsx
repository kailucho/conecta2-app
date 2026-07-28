// ============================================================
// Hoy 🏠 — pantalla principal, estilo "app del clima": encabezado con marca
// y personaje, pronóstico principal (Radar/Bienestar), recomendación del
// día, pronóstico de 7 días, acciones rápidas, mensajes de la pareja y una
// barra de comunicación. Las interacciones secundarias viven en el centro
// de interacciones (bottom sheet) que abre ＋ o el personaje.
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { usarApp } from '../contexto/AppContexto.jsx'
import { usarCiclo } from '../contexto/usarCiclo.js'
import { diaDelAnio } from '../motor/fechas.js'
import { pronosticoDelDia } from '../motor/pronosticoPareja.js'
import EncabezadoHoy from '../componentes/comunes/EncabezadoHoy.jsx'
import Velocimetro from '../componentes/hoy/Velocimetro.jsx'
import ClimaInterno from '../componentes/hoy/ClimaInterno.jsx'
import PronosticoSemanal from '../componentes/hoy/PronosticoSemanal.jsx'
import AccionesRapidasGrid from '../componentes/hoy/AccionesRapidasGrid.jsx'
import TarjetaParaHoy from '../componentes/hoy/TarjetaParaHoy.jsx'
import EstadoActivoChip from '../componentes/hoy/EstadoActivoChip.jsx'
import BotonSOS from '../componentes/comunes/BotonSOS.jsx'
import TarjetaBase from '../componentes/comunes/TarjetaBase.jsx'
import FondoDecorativo from '../componentes/comunes/FondoDecorativo.jsx'
import { expresionPorAccion } from '../motor/expresiones.js'
import { interaccionEntranteMasReciente } from '../motor/interacciones.js'
import BandejaPareja from '../componentes/transversales/BandejaPareja.jsx'
import ConfirmacionRespuesta from '../componentes/transversales/ConfirmacionRespuesta.jsx'
import SugerenciaRegla from '../componentes/hoy/SugerenciaRegla.jsx'
import BarraComunicacion from '../componentes/comunicacion/BarraComunicacion.jsx'
import CentroInteracciones from '../componentes/comunicacion/CentroInteracciones.jsx'
import MensajeLibre from '../componentes/comunicacion/MensajeLibre.jsx'

export default function Hoy({ abrirSOS, irA }) {
  const { perfil, config, interacciones } = usarApp()
  const ciclo = usarCiclo()
  const semilla = diaDelAnio()
  const esElla = perfil.rol === 'ella'

  const [centroAbierto, setCentroAbierto] = useState(false)
  const [mensajeAbierto, setMensajeAbierto] = useState(false)
  const [reaccion, setReaccion] = useState(null) // { expresion, key }
  const timerReaccion = useRef(null)
  const ultimaInteraccionVista = useRef(undefined) // undefined = aún sin inicializar

  // El personaje reacciona brevemente a lo que se envía; luego vuelve a su base.
  function reaccionar(expresion) {
    if (!expresion) return
    clearTimeout(timerReaccion.current)
    setReaccion({ expresion, key: Date.now() })
    timerReaccion.current = setTimeout(() => setReaccion(null), 4000)
  }

  // Pronóstico de hoy: única fuente para Radar/Bienestar, semáforo del
  // encabezado y expresión base del personaje. Respeta privacidad y prioriza
  // el estado real declarado (ver motor/pronosticoPareja.js).
  const pronosticoHoy = pronosticoDelDia(new Date(), {
    ciclo,
    fechaUltimaRegla: ciclo.fechaUltima,
    interacciones,
    userId: perfil.userId,
    partnerId: perfil.partnerId,
    privacidadHormonal: perfil.privacidadHormonal,
    tono: perfil.tonoHumor,
  })
  const mostrarPronostico = !ciclo.menopausia
  const mostrarSinDatos = !ciclo.menopausia && pronosticoHoy.confianza === 'sin_datos'

  // Astro Azul reacciona brevemente cuando llega una interacción NUEVA de la
  // pareja (no en cada render, y no se repite por el mismo id).
  useEffect(() => {
    const masReciente = interaccionEntranteMasReciente(interacciones, perfil.userId, perfil.partnerId)
    if (!masReciente) return
    if (ultimaInteraccionVista.current === undefined) {
      // Primer render con datos: solo memoriza, no reacciona a historial viejo.
      ultimaInteraccionVista.current = masReciente.id
      return
    }
    if (masReciente.id !== ultimaInteraccionVista.current) {
      ultimaInteraccionVista.current = masReciente.id
      const expresionReaccion = expresionPorAccion(masReciente.actionId)
      if (expresionReaccion) reaccionar(expresionReaccion)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interacciones, perfil.userId, perfil.partnerId])

  const expresionMostrada = reaccion?.expresion || pronosticoHoy.expresion

  function abrirMensajeDesdeCentro() {
    setCentroAbierto(false)
    setMensajeAbierto(true)
  }

  // Vincular a la pareja es opcional: el centro de interacciones y el
  // mensaje libre siempre se abren. Sin vínculo, sus acciones preparan un
  // mensaje para WhatsApp en vez de enviar internamente (ver
  // usarEnvioInteraccion.js / MensajeLibre.jsx).
  function abrirCentroOExplicar() {
    setCentroAbierto(true)
  }

  function abrirMensajeOExplicar() {
    setMensajeAbierto(true)
  }

  return (
    <div className="animate-aparecer">
      <FondoDecorativo tema={esElla ? 'ella' : 'el'} />

      <EncabezadoHoy
        rol={perfil.rol}
        nombrePersonaje={esElla ? 'Estrellita' : 'Astro Azul'}
        expresion={expresionMostrada}
        accesorios={!esElla && mostrarPronostico ? pronosticoHoy.accesorios : []}
        alTocarPersonaje={abrirCentroOExplicar}
      />

      <div className="mt-3 space-y-4">
        <EstadoActivoChip />
        {/* Sin datos de ciclo aún (y, en modo él, sin alertas/ánimo de la pareja) */}
        {mostrarSinDatos && (
          <TarjetaBase>
            <p className="text-texto-2">
              {esElla
                ? 'Todavía no tenemos registrado el primer día de la última menstruación.'
                : <>Aún no hay señales para el radar de hoy. En cuanto tu
                    pareja comparta cómo se siente, o registre su ciclo, el
                    radar se activa.</>}
            </p>
            {esElla && (
              <button
                onClick={() => irA('mes')}
                className="mt-3 w-full rounded-pill bg-acento/10 py-2.5 text-sm font-bold text-acento transition-transform active:scale-[0.98]"
              >
                Ir a Calendario 📅
              </button>
            )}
          </TarjetaBase>
        )}

        {/* Etapa menopausia: se oculta velocímetro/clima */}
        {ciclo.menopausia && (
          <TarjetaBase>
            <p className="font-titulo text-lg font-bold text-texto">
              Modo menopausia activado · consulta la Guía
            </p>
            <p className="mt-1 text-sm text-texto-2">
              En esta etapa el foco está en el bienestar y el acompañamiento, no
              en el calendario. Encuentra la guía en Más ⚙️ → Guía 📖.
            </p>
          </TarjetaBase>
        )}

        {/* Pronóstico principal del día según rol */}
        {mostrarPronostico && !mostrarSinDatos && (
          esElla ? (
            <ClimaInterno pronostico={pronosticoHoy} tono={perfil.tonoHumor} onAvisar={() => {}} />
          ) : (
            <Velocimetro pronostico={pronosticoHoy} tono={perfil.tonoHumor} semilla={semilla} />
          )
        )}

        {/* Única recomendación del día */}
        <TarjetaParaHoy
          semilla={semilla}
          faseId={ciclo.fase?.id}
          hayDatos={ciclo.hayDatos}
          onReaccion={reaccionar}
        />

        {/* Pronóstico de los próximos 7 días: nunca se muestra si hoy no hay
            datos suficientes (no se fabrica un número falso para la semana). */}
        {mostrarPronostico && !mostrarSinDatos && config.mostrarPronosticoSemanal !== false && (
          <PronosticoSemanal
            ctx={{
              ciclo,
              fechaUltimaRegla: ciclo.fechaUltima,
              interacciones,
              userId: perfil.userId,
              partnerId: perfil.partnerId,
              privacidadHormonal: perfil.privacidadHormonal,
              tono: perfil.tonoHumor,
            }}
          />
        )}

        {/* Acciones rápidas destacadas */}
        <AccionesRapidasGrid onReaccion={reaccionar} onVerMas={abrirCentroOExplicar} />

        {/* Mensajes recibidos de la pareja (null si no hay) */}
        <BandejaPareja />
        <ConfirmacionRespuesta />
        <SugerenciaRegla />
      </div>

      {/* Barra de comunicación fija + sheets */}
      <BarraComunicacion
        alAbrirCentro={abrirCentroOExplicar}
        alAbrirMensaje={abrirMensajeOExplicar}
        onReaccion={reaccionar}
      />
      <CentroInteracciones
        abierto={centroAbierto}
        alCerrar={() => setCentroAbierto(false)}
        onReaccion={reaccionar}
        irA={irA}
        alAbrirMensaje={abrirMensajeDesdeCentro}
      />
      <MensajeLibre
        abierto={mensajeAbierto}
        alCerrar={() => setMensajeAbierto(false)}
        onReaccion={reaccionar}
      />

      <BotonSOS onClick={abrirSOS} />
    </div>
  )
}
