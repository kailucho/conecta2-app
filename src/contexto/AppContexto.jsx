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
  limpiarTodo,
  generarId,
  migrarVinculacionLegada,
} from '@/servicios/storageService.js'
import { parejaVinculada } from '@/servicios/syncService.js'

const AppContexto = createContext(null)

// ---------- Estado inicial ----------
const CONFIG_POR_DEFECTO = {
  iaActiva: true,
  sonidos: true,
  vibracion: true,
  reducirMovimiento: false,
  gamificacionActiva: true,
  nombreApp: 'Nosotros',
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
          perfil,
          config: { ...CONFIG_POR_DEFECTO, ...config },
          ciclo: { ...CICLO_POR_DEFECTO, ...ciclo },
          gamificacion: { ...GAMIFICACION_POR_DEFECTO, ...gamificacion },
          nosotros: { ...NOSOTROS_POR_DEFECTO, ...nosotros },
          interacciones,
          animoObservado,
          sos,
        },
      })
    })()
  }, [])

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
    },
    [estado.ciclo],
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
    const lista = await obtener(CLAVES.interacciones, [])
    dispatch({ tipo: 'SET_INTERACCIONES', lista })
    return { ok: true, interaccion }
  }, [estado.perfil])

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
    const lista = await obtener(CLAVES.interacciones, [])
    dispatch({ tipo: 'SET_INTERACCIONES', lista })
  }, [])

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
