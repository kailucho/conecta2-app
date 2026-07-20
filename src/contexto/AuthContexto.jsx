// ============================================================
// AuthContexto — sesión de Supabase Auth (email + OTP), independiente del
// AppContexto local. Expone estado de carga, usuario/sesión, y las acciones
// de enviar/verificar OTP y cerrar sesión. Si Supabase no está configurado,
// `supabaseConfigurado` es false y el resto de la app sigue en modo local.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  enviarOTP as enviarOTPServicio,
  verificarOTP as verificarOTPServicio,
  sesionActual,
  cerrarSesion as cerrarSesionServicio,
  onAuthChange,
} from '@/servicios/authService.js'
import { supabaseConfigurado } from '@/servicios/supabaseClient.js'
import { migrarSiHaceFalta } from '@/servicios/migracionLocal.js'

const AuthContexto = createContext(null)

export function ProveedorAuth({ children }) {
  const [sesion, setSesion] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  useEffect(() => {
    let activo = true
    ;(async () => {
      const actual = await sesionActual()
      if (activo) {
        setSesion(actual)
        setCargandoSesion(false)
      }
      if (actual?.user?.id) migrarSiHaceFalta(actual.user.id)
    })()

    const cancelar = onAuthChange((nuevaSesion) => {
      if (activo) setSesion(nuevaSesion)
      if (nuevaSesion?.user?.id) migrarSiHaceFalta(nuevaSesion.user.id)
    })

    return () => {
      activo = false
      cancelar()
    }
  }, [])

  const enviarOTP = useCallback((email) => enviarOTPServicio(email), [])

  const verificarOTP = useCallback(async (email, codigo) => {
    const resultado = await verificarOTPServicio(email, codigo)
    if (resultado.ok) setSesion(resultado.sesion)
    return resultado
  }, [])

  const cerrarSesion = useCallback(async () => {
    const resultado = await cerrarSesionServicio()
    if (resultado.ok) setSesion(null)
    return resultado
  }, [])

  const valor = {
    supabaseConfigurado,
    sesion,
    usuario: sesion?.user || null,
    cargandoSesion,
    enviarOTP,
    verificarOTP,
    cerrarSesion,
  }

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>
}

export function usarAuth() {
  const ctx = useContext(AuthContexto)
  if (!ctx) throw new Error('usarAuth debe usarse dentro de <ProveedorAuth>')
  return ctx
}
