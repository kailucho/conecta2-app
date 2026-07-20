// ============================================================
// AppContexto — estado global de la app (perfil, config, ciclo,
// interacciones, gamificación, nosotros) con persistencia automática.
//
// Usa useReducer para las mutaciones y storageService para persistir.
// Cada slice se hidrata al arrancar y se re-guarda cuando cambia.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react'
import {
  obtener,
  guardar,
  CLAVES,
  agregarInteraccion,
  actualizarInteraccion,
  cancelarInteraccion as cancelarInteraccionStorage,
  agregarOperacion,
  limpiarTodo,
  generarId,
  migrarVinculacionLegada,
} from '@/servicios/storageService.js'
import { parejaVinculada } from '@/servicios/syncService.js'
import { supabaseConfigurado } from '@/servicios/supabaseClient.js'
import { drenarCola, instalarListenersDrenaje } from '@/servicios/colaOffline.js'
import { suscribirRealtime, listarRemotas } from '@/servicios/interactionRepository.js'
import { resumenPareja } from '@/servicios/gamificationRepository.js'
import { calcularNivel } from '@/motor/gamificacion.js'
import { publicarSnapshot } from '@/servicios/cycleShareService.js'
import { normalizarTipoRelacion } from '@/datos/lenguaje.js'

const AppContexto = createContext(null)

// ---------- Estado inicial ----------
const CONFIG_POR_DEFECTO = {
  iaActiva: true,
  sonidos: true,
  vibracion: true,
  reducirMovimiento: false,
  gamificacionActiva: true,
  nombreApp: 'Conecta2',
  pin: null,
  notifSensibles: false, // false = ocultar contenido sensible en notificaciones
  contadorUsoIA: 0,
}

const CICLO_POR_DEFECTO = {
  duracionCiclo: 28,
  duracionRegla: 5,
  registrosRegla: [], // [{ id, fechaInicio, registradoPor }]
  promedioReal: 28,
  variabilidad: 0,
  confiable: true,
  modoFertilidad: 'todavia_no', // "buscando" | "todavia_no"
  etapaVida: 'regular', // regular | irregular | postparto | menopausia
  sintomasMenopausia: [],
}

const GAMIFICACION_POR_DEFECTO = {
  puntos: 0,
  nivel: 0,
  logros: [],
  rachas: {},
  activa: true,
}

const NOSOTROS_POR_DEFECTO = {
  termometro: [],
  citas: [],
  frecuenciaCitas: 'semanal',
  metas: [],
  deseos: [],
}

const ESTADO_INICIAL = {
  cargando: true,
  perfil: null, // null = falta onboarding
  config: CONFIG_POR_DEFECTO,
  ciclo: CICLO_POR_DEFECTO,
  gamificacion: GAMIFICACION_POR_DEFECTO,
  nosotros: NOSOTROS_POR_DEFECTO,
  interacciones: [],
  animoObservado: [],
  sos: { usos: [] },
  solicitudVinculacion: null,
  errorInteraccion: null,
}

// ---------- Reducer ----------
function reducer(estado, accion) {
  switch (accion.tipo) {
    case 'HIDRATAR':
      return { ...estado, ...accion.datos, cargando: false }
    case 'SET_PERFIL':
      return { ...estado, perfil: accion.perfil }
    case 'SET_CONFIG':
      return { ...estado, config: { ...estado.config, ...accion.cambios } }
    case 'SET_CICLO':
      return { ...estado, ciclo: { ...estado.ciclo, ...accion.cambios } }
    case 'SET_GAMIFICACION':
      return {
        ...estado,
        gamificacion: { ...estado.gamificacion, ...accion.cambios },
      }
    case 'SET_NOSOTROS':
      return { ...estado, nosotros: { ...estado.nosotros, ...accion.cambios } }
    case 'SET_INTERACCIONES':
      return { ...estado, interacciones: accion.lista }
    case 'SET_ANIMO_OBSERVADO':
      return { ...estado, animoObservado: accion.lista }
    case 'SET_SOS':
      return { ...estado, sos: { ...estado.sos, ...accion.cambios } }
    case 'SOLICITAR_VINCULACION':
      return { ...estado, solicitudVinculacion: accion.intencion || { tipo: 'interaccion' } }
    case 'CERRAR_SOLICITUD_VINCULACION':
      return { ...estado, solicitudVinculacion: null }
    case 'SET_ERROR_INTERACCION':
      return { ...estado, errorInteraccion: accion.motivo }
    default:
      return estado
  }
}

// ---------- Provider ----------
export function ProveedorApp({ children }) {
  const [estado, dispatch] = useReducer(reducer, ESTADO_INICIAL)

  // Hidratación inicial desde localStorage.
  useEffect(() => {
    ;(async () => {
      await migrarVinculacionLegada()
      const [
        perfil,
        config,
        ciclo,
        gamificacion,
        nosotros,
        interacciones,
        animoObservado,
        sos,
      ] = await Promise.all([
        obtener(CLAVES.perfil, null),
        obtener(CLAVES.config, CONFIG_POR_DEFECTO),
        obtener(CLAVES.ciclo, CICLO_POR_DEFECTO),
        obtener(CLAVES.gamificacion, GAMIFICACION_POR_DEFECTO),
        obtener(CLAVES.nosotros, NOSOTROS_POR_DEFECTO),
        obtener(CLAVES.interacciones, []),
        obtener(CLAVES.animoObservado, []),
        obtener(CLAVES.sos, { usos: [] }),
      ])
      dispatch({
        tipo: 'HIDRATAR',
        datos: {
          // Normaliza perfiles locales antiguos (casados/convivientes/novios)
          // al esquema binario de convivencia sin duplicar la lógica.
          perfil: perfil
            ? { ...perfil, tipoRelacion: normalizarTipoRelacion(perfil.tipoRelacion) }
            : perfil,
          config: { ...CONFIG_POR_DEFECTO, ...config },
          ciclo: { ...CICLO_POR_DEFECTO, ...ciclo },
          gamificacion: { ...GAMIFICACION_POR_DEFECTO, ...gamificacion },
          nosotros: { ...NOSOTROS_POR_DEFECTO, ...nosotros },
          interacciones,
          animoObservado,
          sos,
        },
      })
      // Intenta drenar lo que haya quedado pendiente de una sesión anterior.
      if (supabaseConfigurado) drenarCola()
    })()
  }, [])

  // Reintenta la cola offline al recuperar conexión o volver la PWA a primer plano.
  useEffect(() => {
    if (!supabaseConfigurado) return undefined
    return instalarListenersDrenaje()
  }, [])

  // Refresca la lista local tras cualquier drenaje exitoso de la cola.
  const refrescarInteracciones = useCallback(async () => {
    const lista = await obtener(CLAVES.interacciones, [])
    dispatch({ tipo: 'SET_INTERACCIONES', lista })
  }, [])

  // Fusiona una interacción recibida por Realtime en la caché local (dedupe por id).
  const fusionarInteraccionRemota = useCallback(async (remota) => {
    const lista = await obtener(CLAVES.interacciones, [])
    const idx = lista.findIndex((it) => it.id === remota.id)
    let siguiente
    if (idx === -1) {
      siguiente = [remota, ...lista]
    } else {
      siguiente = [...lista]
      siguiente[idx] = { ...siguiente[idx], ...remota }
    }
    await guardar(CLAVES.interacciones, siguiente)
    dispatch({ tipo: 'SET_INTERACCIONES', lista: siguiente })
  }, [])

  // Trae el historial remoto al vincularse (Realtime solo entrega cambios
  // NUEVOS después de suscribirse; sin este fetch, lo que la pareja envió
  // antes de que este dispositivo se suscribiera nunca aparecería).
  useEffect(() => {
    if (!supabaseConfigurado) return
    if (!parejaVinculada(estado.perfil)) return
    ;(async () => {
      const resultado = await listarRemotas(estado.perfil.coupleId)
      if (!resultado.ok) return
      const lista = await obtener(CLAVES.interacciones, [])
      const porId = new Map(lista.map((it) => [it.id, it]))
      for (const remota of resultado.interacciones) {
        porId.set(remota.id, { ...porId.get(remota.id), ...remota })
      }
      const fusionada = Array.from(porId.values()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )
      await guardar(CLAVES.interacciones, fusionada)
      dispatch({ tipo: 'SET_INTERACCIONES', lista: fusionada })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.perfil?.coupleId, estado.perfil?.estadoVinculacion])

  // Suscripción Realtime a las interacciones de la pareja activa.
  useEffect(() => {
    if (!supabaseConfigurado) return undefined
    if (!parejaVinculada(estado.perfil)) return undefined
    const cancelar = suscribirRealtime(estado.perfil.coupleId, (remota) => {
      fusionarInteraccionRemota(remota)
    })
    return cancelar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.perfil?.coupleId, estado.perfil?.estadoVinculacion])

  // Reconcilia los puntos locales con el total remoto (point_events) de la
  // pareja activa: nunca resta, solo adopta el remoto si es mayor al local
  // (p.ej. porque se otorgaron puntos desde el otro dispositivo).
  useEffect(() => {
    if (!supabaseConfigurado) return
    if (!parejaVinculada(estado.perfil)) return
    ;(async () => {
      const resultado = await resumenPareja(estado.perfil.coupleId)
      if (!resultado.ok) return
      const mio = resultado.porUsuario[estado.perfil.userId]
      if (mio && mio.puntos > estado.gamificacion.puntos) {
        const nueva = { ...estado.gamificacion, puntos: mio.puntos, nivel: calcularNivel(mio.puntos) }
        await guardar(CLAVES.gamificacion, nueva)
        dispatch({ tipo: 'SET_GAMIFICACION', cambios: nueva })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.perfil?.coupleId, estado.perfil?.estadoVinculacion])

  // ---------- Acciones expuestas ----------

  const guardarPerfil = useCallback(async (perfil) => {
    await guardar(CLAVES.perfil, perfil)
    dispatch({ tipo: 'SET_PERFIL', perfil })
  }, [])

  const actualizarConfig = useCallback(
    async (cambios) => {
      const nueva = { ...estado.config, ...cambios }
      await guardar(CLAVES.config, nueva)
      dispatch({ tipo: 'SET_CONFIG', cambios })
    },
    [estado.config],
  )

  const actualizarCiclo = useCallback(
    async (cambios) => {
      const nuevo = { ...estado.ciclo, ...cambios }
      await guardar(CLAVES.ciclo, nuevo)
      dispatch({ tipo: 'SET_CICLO', cambios })
      // Publica el resumen filtrado (nunca los datos crudos) para la pareja.
      if (supabaseConfigurado && parejaVinculada(estado.perfil)) {
        publicarSnapshot(nuevo, estado.perfil)
      }
    },
    [estado.ciclo, estado.perfil],
  )

  const actualizarGamificacion = useCallback(
    async (cambios) => {
      const nueva = { ...estado.gamificacion, ...cambios }
      await guardar(CLAVES.gamificacion, nueva)
      dispatch({ tipo: 'SET_GAMIFICACION', cambios })
    },
    [estado.gamificacion],
  )

  const actualizarNosotros = useCallback(
    async (cambios) => {
      const nuevo = { ...estado.nosotros, ...cambios }
      await guardar(CLAVES.nosotros, nuevo)
      dispatch({ tipo: 'SET_NOSOTROS', cambios })
    },
    [estado.nosotros],
  )

  const registrarSOS = useCallback(
    async (escenario) => {
      const usos = [
        ...estado.sos.usos,
        { fecha: new Date().toISOString(), escenario },
      ]
      await guardar(CLAVES.sos, { usos })
      dispatch({ tipo: 'SET_SOS', cambios: { usos } })
    },
    [estado.sos],
  )

  // Registros locales y envíos a pareja son operaciones distintas.
  const crearInteraccionLocal = useCallback(async (parcial) => {
    const interaccion = {
      id: generarId(),
      createdAt: new Date().toISOString(),
      status: 'local',
      ...parcial,
      receiverId: null,
    }
    const guardada = await agregarInteraccion(interaccion)
    if (!guardada) {
      dispatch({ tipo: 'SET_ERROR_INTERACCION', motivo: 'error_persistencia' })
      return { ok: false, motivo: 'error_persistencia' }
    }
    const lista = await obtener(CLAVES.interacciones, [])
    dispatch({ tipo: 'SET_INTERACCIONES', lista })
    return { ok: true, interaccion }
  }, [])

  const enviarInteraccionPareja = useCallback(async (parcial, intencion = null) => {
    if (!parejaVinculada(estado.perfil)) {
      dispatch({
        tipo: 'SOLICITAR_VINCULACION',
        intencion: intencion || {
          tipo: parcial.type || 'interaccion',
          actionId: parcial.actionId || null,
          note: parcial.note || null,
        },
      })
      return { ok: false, motivo: 'sin_pareja_vinculada' }
    }

    const interaccion = {
      ...parcial,
      id: generarId(),
      createdAt: new Date().toISOString(),
      status: 'pendiente_sync',
      coupleId: estado.perfil.coupleId,
      senderId: estado.perfil.userId,
      receiverId: estado.perfil.partnerId,
    }
    const guardada = await agregarInteraccion(interaccion)
    if (!guardada) {
      dispatch({ tipo: 'SET_ERROR_INTERACCION', motivo: 'error_persistencia' })
      return { ok: false, motivo: 'error_persistencia' }
    }
    if (supabaseConfigurado) {
      await agregarOperacion({
        entity: 'interactions',
        action: 'insert',
        entityId: interaccion.id,
        payload: interaccion,
      })
      drenarCola().then(refrescarInteracciones)
    }
    const lista = await obtener(CLAVES.interacciones, [])
    dispatch({ tipo: 'SET_INTERACCIONES', lista })
    return { ok: true, interaccion }
  }, [estado.perfil, refrescarInteracciones])

  // Compatibilidad defensiva para cualquier consumidor que aún use la API
  // anterior: un receiverId siempre activa el mismo guard central.
  const crearInteraccion = useCallback(
    (parcial) => parcial?.receiverId
      ? enviarInteraccionPareja(parcial)
      : crearInteraccionLocal(parcial),
    [crearInteraccionLocal, enviarInteraccionPareja],
  )

  const solicitarVinculacion = useCallback((intencion = null) => {
    dispatch({ tipo: 'SOLICITAR_VINCULACION', intencion })
  }, [])

  const cerrarSolicitudVinculacion = useCallback(() => {
    dispatch({ tipo: 'CERRAR_SOLICITUD_VINCULACION' })
  }, [])

  const limpiarErrorInteraccion = useCallback(() => {
    dispatch({ tipo: 'SET_ERROR_INTERACCION', motivo: null })
  }, [])

  const editarInteraccion = useCallback(async (id, cambios) => {
    await actualizarInteraccion(id, cambios)
    if (supabaseConfigurado && cambios.status === 'acknowledged') {
      await agregarOperacion({
        entity: 'interactions',
        action: 'update',
        entityId: id,
        payload: { respuestaTexto: cambios.respuestaTexto || null },
      })
      drenarCola().then(refrescarInteracciones)
    }
    const lista = await obtener(CLAVES.interacciones, [])
    dispatch({ tipo: 'SET_INTERACCIONES', lista })
  }, [refrescarInteracciones])

  // Cancela una interacción propia (solo el emisor puede hacerlo).
  const cancelarInteraccion = useCallback(async (id) => {
    await cancelarInteraccionStorage(id)
    if (supabaseConfigurado) {
      await agregarOperacion({
        entity: 'interactions',
        action: 'update',
        entityId: id,
        payload: { tipo: 'cancelar' },
      })
      drenarCola().then(refrescarInteracciones)
    }
    const lista = await obtener(CLAVES.interacciones, [])
    dispatch({ tipo: 'SET_INTERACCIONES', lista })
  }, [refrescarInteracciones])

  const registrarAnimoObservado = useCallback(
    async (registro) => {
      const lista = [registro, ...estado.animoObservado].slice(0, 400)
      await guardar(CLAVES.animoObservado, lista)
      dispatch({ tipo: 'SET_ANIMO_OBSERVADO', lista })
    },
    [estado.animoObservado],
  )

  const reiniciarApp = useCallback(async () => {
    await limpiarTodo()
    window.location.reload()
  }, [])

  const valor = {
    ...estado,
    guardarPerfil,
    actualizarConfig,
    actualizarCiclo,
    actualizarGamificacion,
    actualizarNosotros,
    registrarSOS,
    crearInteraccionLocal,
    enviarInteraccionPareja,
    crearInteraccion,
    editarInteraccion,
    cancelarInteraccion,
    registrarAnimoObservado,
    solicitarVinculacion,
    cerrarSolicitudVinculacion,
    limpiarErrorInteraccion,
    reiniciarApp,
  }

  return <AppContexto.Provider value={valor}>{children}</AppContexto.Provider>
}

// Hook de acceso al contexto.
export function usarApp() {
  const ctx = useContext(AppContexto)
  if (!ctx) throw new Error('usarApp debe usarse dentro de <ProveedorApp>')
  return ctx
}
