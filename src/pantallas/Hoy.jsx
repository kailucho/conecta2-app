// ============================================================
// Hoy 🏠 — pantalla principal, simplificada.
// Estructura ligera: encabezado, personaje interactivo, resumen del día
// (Clima/Velocímetro por rol), mensajes de la pareja, una sola tarjeta "Para
// hoy" y una barra de comunicación. Las interacciones secundarias viven en el
// centro de interacciones (bottom sheet) que abre ＋ o el personaje.
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { usarApp } from '../contexto/AppContexto.jsx'
import { usarCiclo } from '../contexto/usarCiclo.js'
import { diaDelAnio } from '../motor/fechas.js'
import { comoLlamarParejaCap } from '../datos/lenguaje.js'
import { calcularRadarPeligrosidad } from '../motor/radarPeligrosidad.js'
import EncabezadoHoy from '../componentes/comunes/EncabezadoHoy.jsx'
import Velocimetro from '../componentes/hoy/Velocimetro.jsx'
import ClimaInterno from '../componentes/hoy/ClimaInterno.jsx'
import TarjetaParaHoy from '../componentes/hoy/TarjetaParaHoy.jsx'
import EstadoActivoChip from '../componentes/hoy/EstadoActivoChip.jsx'
import BotonSOS from '../componentes/comunes/BotonSOS.jsx'
import TarjetaBase from '../componentes/comunes/TarjetaBase.jsx'
import Personaje from '../componentes/personajes/Personaje.jsx'
import FondoDecorativo from '../componentes/comunes/FondoDecorativo.jsx'
import { EXPRESIONES, expresionPorFase, expresionPorAccion } from '../motor/expresiones.js'
import { interaccionEntranteMasReciente } from '../motor/interacciones.js'
import BandejaPareja from '../componentes/transversales/BandejaPareja.jsx'
import ConfirmacionRespuesta from '../componentes/transversales/ConfirmacionRespuesta.jsx'
import SugerenciaRegla from '../componentes/hoy/SugerenciaRegla.jsx'
import BarraComunicacion from '../componentes/comunicacion/BarraComunicacion.jsx'
import CentroInteracciones from '../componentes/comunicacion/CentroInteracciones.jsx'
import MensajeLibre from '../componentes/comunicacion/MensajeLibre.jsx'
import { parejaVinculada } from '../servicios/syncService.js'

export default function Hoy({ abrirSOS, irA }) {
  const { perfil, config, interacciones, solicitarVinculacion } = usarApp()
  const ciclo = usarCiclo()
  const semilla = diaDelAnio()
  const esElla = perfil.rol === 'ella'
  const vinculada = parejaVinculada(perfil)

  const [centroAbierto, setCentroAbierto] = useState(false)
  const [mensajeAbierto, setMensajeAbierto] = useState(false)
  const [reaccion, setReaccion] = useState(null) // { expresion, key }
  const timerReaccion = useRef(null)
  const ultimaInteraccionVista = useRef(undefined) // undefined = aún sin inicializar

  // Privacidad: en modo él, si la pareja restringió a "solo alertas", no se
  // muestra la fase en el encabezado. (En modo ella siempre ve su propia info.)
  const mostrarFase = esElla || perfil.privacidadHormonal !== 'solo_alertas'

  const saludo = esElla
    ? '¿Cómo amaneciste? 💗'
    : `¿Cómo está ${comoLlamarParejaCap(perfil.rol, perfil.tipoRelacion)}? 💙`

  // El personaje reacciona brevemente a lo que se envía; luego vuelve a su base.
  function reaccionar(expresion) {
    if (!expresion) return
    clearTimeout(timerReaccion.current)
    setReaccion({ expresion, key: Date.now() })
    timerReaccion.current = setTimeout(() => setReaccion(null), 4000)
  }

  // Radar de peligrosidad (modo él): combina alertas/ánimo declarados por la
  // pareja con el score del ciclo, respetando la privacidad hormonal.
  const radar = calcularRadarPeligrosidad({
    scoreCiclo: ciclo.hayDatos && !ciclo.menopausia ? ciclo.score : null,
    interacciones,
    userId: perfil.userId,
    partnerId: perfil.partnerId,
    privacidadHormonal: perfil.privacidadHormonal,
  })
  const mostrarRadar = !esElla && !ciclo.menopausia && (ciclo.hayDatos || radar.hayInsumos)
  const mostrarSinDatos = !ciclo.menopausia && !ciclo.hayDatos && !mostrarRadar

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

  const expresionBase =
    esElla && ciclo.hayDatos && !ciclo.menopausia
      ? expresionPorFase(ciclo.fase.id)
      : EXPRESIONES.feliz
  const expresionMostrada = reaccion?.expresion || expresionBase

  function abrirMensajeDesdeCentro() {
    setCentroAbierto(false)
    setMensajeAbierto(true)
  }

  function abrirCentroOExplicar() {
    if (!vinculada) {
      solicitarVinculacion({ tipo: 'explorar_interacciones' })
      return
    }
    setCentroAbierto(true)
  }

  function abrirMensajeOExplicar() {
    if (!vinculada) {
      solicitarVinculacion({ tipo: 'mensaje', note: null })
      return
    }
    setMensajeAbierto(true)
  }

  return (
    <div className="animate-aparecer">
      <FondoDecorativo tema={esElla ? 'ella' : 'el'} />

      <EncabezadoHoy
        fase={ciclo.fase}
        dia={ciclo.dia}
        mostrarFase={mostrarFase && ciclo.hayDatos && !ciclo.menopausia}
        saludo={saludo}
      />

      {/* Personaje héroe interactivo: abre el centro de interacciones. */}
      <div className="mb-1 flex justify-center">
        <div
          key={reaccion?.key}
          className={
            reaccion && !config.reducirMovimiento
              ? 'animate-[reaccion-pop_0.4s_ease-out]'
              : ''
          }
        >
          <Personaje
            rol={perfil.rol}
            tamano={150}
            expresion={expresionMostrada}
            accesorios={!esElla && mostrarRadar ? radar.accesorios : []}
            alTocar={abrirCentroOExplicar}
          />
        </div>
      </div>
      <EstadoActivoChip />

      <div className="mt-3 space-y-3">
        {/* Sin datos de ciclo aún (y, en modo él, sin alertas/ánimo de la pareja) */}
        {mostrarSinDatos && (
          <TarjetaBase>
            <p className="text-texto-2">
              {esElla
                ? <>Todavía no tenemos registrado el primer día de la última
                    menstruación. Ve a la pestaña{' '}
                    <strong className="text-texto">Mes 📅</strong> para
                    registrarla y activar el cálculo de fases.</>
                : <>Aún no hay señales para el radar de hoy. En cuanto tu
                    pareja comparta cómo se siente, o registre su ciclo, el
                    radar se activa.</>}
            </p>
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

        {/* Resumen del día según rol */}
        {esElla && ciclo.hayDatos && !ciclo.menopausia && (
          <ClimaInterno
            fase={ciclo.fase}
            tono={perfil.tonoHumor}
            zonaRoja={ciclo.zonaRoja}
          />
        )}
        {mostrarRadar && (
          <Velocimetro
            radar={radar}
            fase={radar.mostrarFase ? ciclo.fase : null}
            tono={perfil.tonoHumor}
            semilla={semilla}
          />
        )}

        {/* Mensajes recibidos de la pareja (null si no hay) */}
        <BandejaPareja />
        <ConfirmacionRespuesta />
        <SugerenciaRegla />

        {/* Única recomendación del día */}
        <TarjetaParaHoy
          semilla={semilla}
          faseId={ciclo.fase?.id}
          hayDatos={ciclo.hayDatos}
          onReaccion={reaccionar}
        />
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
