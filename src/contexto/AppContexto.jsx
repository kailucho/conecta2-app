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
} from '@/servicios/storageService.js'

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

  // Crea y guarda una interacción, refrescando el estado en memoria.
  const crearInteraccion = useCallback(async (parcial) => {
    const interaccion = {
      id: generarId(),
      createdAt: new Date().toISOString(),
      status: 'pendiente_sync',
      ...parcial,
    }
    await agregarInteraccion(interaccion)
    const lista = await obtener(CLAVES.interacciones, [])
    dispatch({ tipo: 'SET_INTERACCIONES', lista })
    return interaccion
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
    crearInteraccion,
    editarInteraccion,
    registrarAnimoObservado,
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
