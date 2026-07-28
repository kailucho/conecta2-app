import { useCallback, useEffect, useRef, useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import BotonGrande from '../comunes/BotonGrande.jsx'
import PantallaAcceso from '../auth/PantallaAcceso.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarAuth } from '../../contexto/AuthContexto.jsx'
import {
  ESTADOS_VINCULACION,
  parejaVinculada,
} from '../../servicios/syncService.js'
import {
  crearInvitacion,
  aceptarInvitacion,
  revocarInvitacion,
  salirPareja,
  parejaActual,
} from '../../servicios/coupleService.js'
import { upsertPerfil } from '../../servicios/profileService.js'
import IndicadorConexion from '../comunes/IndicadorConexion.jsx'
import IndicadorSync from '../comunes/IndicadorSync.jsx'

const MENSAJES_ERROR = {
  supabase_no_configurado: 'La sincronización todavía no está configurada en esta instalación.',
  sesion_expirada: 'Tu sesión expiró. Vuelve a ingresar con tu correo.',
  usuario_ya_vinculado: 'Ya estás vinculado con alguien. Sal de esa pareja primero si quieres cambiar.',
  codigo_invalido: 'Ese código no existe. Revísalo con tu pareja.',
  codigo_revocado: 'Ese código fue revocado. Pide uno nuevo.',
  codigo_ya_usado: 'Ese código ya fue usado.',
  codigo_expirado: 'Ese código expiró. Pide uno nuevo.',
  no_puedes_aceptar_tu_propio_codigo: 'No puedes usar tu propio código. Compártelo con tu pareja.',
  pareja_completa: 'Esa pareja ya tiene dos miembros.',
  sin_conexion: 'No hay conexión a internet en este momento.',
  error_inesperado: 'Algo no salió bien. Intenta de nuevo en unos segundos.',
}

function mensajeError(motivo) {
  return MENSAJES_ERROR[motivo] || MENSAJES_ERROR.error_inesperado
}

export default function InvitarPareja({ enfocar = false, alEnfocar }) {
  const { perfil, guardarPerfil } = usarApp()
  const { supabaseConfigurado, usuario, cargandoSesion } = usarAuth()
  const seccionRef = useRef(null)
  const vinculada = parejaVinculada(perfil)
  const pendiente = perfil.estadoVinculacion === ESTADOS_VINCULACION.PENDIENTE

  const [accesoAbierto, setAccesoAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [invitacion, setInvitacion] = useState(null) // { codigo, expiraEl }
  const [codigoIngresado, setCodigoIngresado] = useState('')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!enfocar) return
    seccionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    seccionRef.current?.focus()
    alEnfocar?.()
  }, [enfocar, alEnfocar])

  // Aplica el resultado de vinculación al perfil local (única fuente de verdad de la UI).
  const sincronizarDesdeServidor = useCallback(async () => {
    if (!supabaseConfigurado || !usuario) return
    const resultado = await parejaActual()
    if (!resultado.ok) {
      if (resultado.motivo !== 'supabase_no_configurado') setError(mensajeError(resultado.motivo))
      return
    }
    if (resultado.partnerId) {
      await guardarPerfil({
        ...perfil,
        userId: usuario.id,
        coupleId: resultado.coupleId,
        partnerId: resultado.partnerId,
        estadoVinculacion: ESTADOS_VINCULACION.VINCULADA,
      })
      setInvitacion(null)
    } else if (resultado.coupleId) {
      await guardarPerfil({
        ...perfil,
        userId: usuario.id,
        coupleId: resultado.coupleId,
        partnerId: null,
        estadoVinculacion: ESTADOS_VINCULACION.PENDIENTE,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseConfigurado, usuario])

  useEffect(() => {
    sincronizarDesdeServidor()
  }, [sincronizarDesdeServidor])

  async function alGenerarCodigo() {
    if (!usuario) {
      setAccesoAbierto(true)
      return
    }
    setError(null)
    setCargando(true)
    try {
      await upsertPerfil(perfil) // asegura que el perfil remoto exista antes de vincular
      const resultado = await crearInvitacion()
      if (!resultado.ok) {
        setError(mensajeError(resultado.motivo))
        return
      }
      setInvitacion({ codigo: resultado.codigo, expiraEl: resultado.expiraEl })
      await guardarPerfil({
        ...perfil,
        userId: usuario.id,
        coupleId: resultado.coupleId,
        partnerId: null,
        estadoVinculacion: ESTADOS_VINCULACION.PENDIENTE,
      })
    } catch (e) {
      console.error('[InvitarPareja] alGenerarCodigo:', e)
      setError(mensajeError('error_inesperado'))
    } finally {
      setCargando(false)
    }
  }

  async function alCopiarCodigo() {
    if (!invitacion) return
    try {
      await navigator.clipboard.writeText(invitacion.codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Si el navegador bloquea el portapapeles, el código sigue visible para copiarlo a mano.
    }
  }

  async function alCompartirCodigo() {
    if (!invitacion) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Conecta2',
          text: `Vincúlate conmigo en Conecta2 con este código: ${invitacion.codigo}`,
        })
      } catch {
        // El usuario canceló el share; no es un error a mostrar.
      }
    } else {
      alCopiarCodigo()
    }
  }

  async function alUnirse(e) {
    e.preventDefault()
    if (!usuario) {
      setAccesoAbierto(true)
      return
    }
    setError(null)
    setCargando(true)
    try {
      await upsertPerfil(perfil)
      const resultado = await aceptarInvitacion(codigoIngresado)
      if (!resultado.ok) {
        setError(mensajeError(resultado.motivo))
        return
      }
      setCodigoIngresado('')
      await guardarPerfil({
        ...perfil,
        userId: usuario.id,
        coupleId: resultado.coupleId,
        partnerId: null, // se completa en la próxima sincronización
        estadoVinculacion: ESTADOS_VINCULACION.VINCULADA,
      })
      await sincronizarDesdeServidor()
    } catch (e) {
      console.error('[InvitarPareja] alUnirse:', e)
      setError(mensajeError('error_inesperado'))
    } finally {
      setCargando(false)
    }
  }

  async function alSalir() {
    setError(null)
    setCargando(true)
    const resultado = await salirPareja()
    setCargando(false)
    if (!resultado.ok) {
      setError(mensajeError(resultado.motivo))
      return
    }
    setInvitacion(null)
    await guardarPerfil({
      ...perfil,
      coupleId: null,
      partnerId: null,
      estadoVinculacion: ESTADOS_VINCULACION.NO_VINCULADA,
    })
  }

  return (
    <section ref={seccionRef} tabIndex={-1} aria-labelledby="titulo-vinculacion" className="outline-none">
      <TarjetaBase className={enfocar ? 'ring-2 ring-acento ring-offset-2 ring-offset-fondo' : ''}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p id="titulo-vinculacion" className="font-titulo font-bold text-texto">
            👩‍❤️‍👨 Vinculación de pareja
          </p>
          <span className="rounded-pill bg-alerta/20 px-2 py-0.5 text-xs font-bold text-alerta">
            {vinculada ? 'Vinculada' : pendiente ? 'Pendiente' : 'Sin vincular'}
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
          La vinculación permite que cada uno use la app desde su celular y reciba
          las interacciones del otro. Es completamente opcional: puedes usar
          Conecta2 y comunicarte por WhatsApp sin vincular a tu pareja.
        </p>

        {vinculada && (
          <div className="mt-3 flex items-center gap-3 border-t border-borde pt-3">
            <IndicadorConexion />
            <IndicadorSync />
          </div>
        )}

        {!supabaseConfigurado && (
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

        {supabaseConfigurado && !cargandoSesion && (
          <div className="mt-3 space-y-3">
            {error && (
              <p role="alert" className="rounded-xl bg-peligro/10 p-3 text-sm text-peligro">
                {error}
              </p>
            )}

            {vinculada ? (
              <BotonGrande variante="suave" onClick={alSalir} disabled={cargando} className="w-full">
                {cargando ? 'Saliendo…' : 'Salir de la pareja'}
              </BotonGrande>
            ) : (
              <>
                {invitacion ? (
                  <div className="rounded-xl bg-acento/10 p-3">
                    <p className="text-xs text-texto-3">Tu código (compártelo con tu pareja)</p>
                    <p className="my-1 text-center font-titulo text-3xl font-bold tracking-[0.3em] text-texto">
                      {invitacion.codigo}
                    </p>
                    <p className="text-center text-xs text-texto-3">
                      Expira el {new Date(invitacion.expiraEl).toLocaleString('es-PE')}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={alCopiarCodigo}
                        className="min-h-touch rounded-pill border border-borde py-2 text-sm font-semibold text-texto"
                      >
                        {copiado ? '¡Copiado! ✅' : 'Copiar'}
                      </button>
                      <button
                        onClick={alCompartirCodigo}
                        className="min-h-touch rounded-pill border border-borde py-2 text-sm font-semibold text-texto"
                      >
                        Compartir
                      </button>
                    </div>
                    <p className="mt-3 text-center text-sm text-texto-2">Esperando a tu pareja… 💛</p>
                    <button
                      onClick={alGenerarCodigo}
                      disabled={cargando}
                      className="mt-2 w-full text-center text-xs font-semibold text-acento"
                    >
                      Generar otro código
                    </button>
                  </div>
                ) : pendiente ? (
                  <div className="rounded-xl bg-tarjeta-hover p-3">
                    <p className="text-sm text-texto">
                      Ya generaste un código antes y sigue esperando a tu pareja.
                    </p>
                    <button
                      onClick={alGenerarCodigo}
                      disabled={cargando}
                      className="mt-2 w-full rounded-pill bg-acento py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {cargando ? 'Generando…' : 'Ver el código de nuevo'}
                    </button>
                  </div>
                ) : (
                  <BotonGrande onClick={alGenerarCodigo} disabled={cargando} className="w-full">
                    {cargando ? 'Generando…' : 'Generar código de invitación'}
                  </BotonGrande>
                )}

                {pendiente && (
                  <button
                    onClick={alSalir}
                    disabled={cargando}
                    className="w-full rounded-pill border border-borde py-2.5 text-sm font-semibold text-texto-2 disabled:opacity-50"
                  >
                    {cargando ? 'Cancelando…' : 'Cancelar mi código y unirme con otro'}
                  </button>
                )}

                <form onSubmit={alUnirse} className="space-y-2">
                  <label htmlFor="ip-codigo" className="block text-sm font-semibold text-texto">
                    ¿Tu pareja te dio un código? Ingrésalo aquí
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="ip-codigo"
                      type="text"
                      maxLength={6}
                      value={codigoIngresado}
                      onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                      className="min-h-touch flex-1 rounded-card border border-borde bg-tarjeta px-3 py-2 text-center font-titulo tracking-[0.2em] text-texto outline-none focus:border-acento"
                      placeholder="ABC123"
                    />
                    <button
                      type="submit"
                      disabled={cargando || codigoIngresado.length < 4}
                      className="min-h-touch rounded-pill bg-acento px-4 font-titulo font-bold text-white disabled:opacity-50"
                    >
                      Unirme
                    </button>
                  </div>
                </form>
              </>
            )}

            {!usuario && (
              <p className="text-center text-xs text-texto-3">
                Necesitas iniciar sesión con tu correo antes de generar o usar un código.
              </p>
            )}
          </div>
        )}
      </TarjetaBase>

      <PantallaAcceso
        abierto={accesoAbierto}
        alCerrar={() => setAccesoAbierto(false)}
        alAutenticado={() => sincronizarDesdeServidor()}
      />
    </section>
  )
}
