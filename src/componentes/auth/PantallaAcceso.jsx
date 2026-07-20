// ============================================================
// PantallaAcceso — inicio de sesión sin contraseña (correo + OTP de 6
// dígitos). Se muestra solo cuando el usuario intenta vincularse con su
// pareja o activar la sincronización, nunca en el onboarding inicial.
// Usa el mismo ModalHoja del resto de la app para no alterar el UI.
// ============================================================

import { useState } from 'react'
import ModalHoja from '../comunes/ModalHoja.jsx'
import BotonGrande from '../comunes/BotonGrande.jsx'
import { usarAuth } from '../../contexto/AuthContexto.jsx'

const MENSAJES_ERROR = {
  supabase_no_configurado:
    'La sincronización todavía no está configurada en esta instalación.',
  correo_invalido: 'Ese correo no parece válido. Revísalo e intenta de nuevo.',
  codigo_invalido: 'El código debe tener 6 dígitos.',
  otp_incorrecto: 'El código no es correcto. Revisa tu correo e intenta de nuevo.',
  otp_expirado: 'El código expiró. Pide uno nuevo.',
  demasiados_intentos: 'Demasiados intentos. Espera un momento y vuelve a intentar.',
  sin_conexion: 'No hay conexión a internet en este momento.',
  error_inesperado: 'Algo no salió bien. Intenta de nuevo en unos segundos.',
}

function mensajeError(motivo) {
  return MENSAJES_ERROR[motivo] || MENSAJES_ERROR.error_inesperado
}

export default function PantallaAcceso({ abierto, alCerrar, alAutenticado }) {
  const { enviarOTP, verificarOTP } = usarAuth()
  const [paso, setPaso] = useState('correo') // correo | codigo
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  function cerrarYReiniciar() {
    setPaso('correo')
    setEmail('')
    setCodigo('')
    setError(null)
    alCerrar?.()
  }

  async function alEnviarCorreo(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const resultado = await enviarOTP(email)
    setCargando(false)
    if (!resultado.ok) {
      setError(mensajeError(resultado.motivo))
      return
    }
    setPaso('codigo')
  }

  async function alVerificarCodigo(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const resultado = await verificarOTP(email, codigo)
    setCargando(false)
    if (!resultado.ok) {
      setError(mensajeError(resultado.motivo))
      return
    }
    alAutenticado?.(resultado)
    cerrarYReiniciar()
  }

  return (
    <ModalHoja
      abierto={abierto}
      alCerrar={cerrarYReiniciar}
      titulo={paso === 'correo' ? 'Ingresa con tu correo' : 'Escribe el código'}
    >
      {paso === 'correo' ? (
        <form onSubmit={alEnviarCorreo} className="space-y-4">
          <p className="text-sm text-texto-2">
            Te enviaremos un código de 6 dígitos para entrar sin contraseña.
          </p>
          <div>
            <label htmlFor="pa-correo" className="mb-1 block text-sm font-semibold text-texto">
              Correo electrónico
            </label>
            <input
              id="pa-correo"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-touch w-full rounded-card border border-borde bg-tarjeta px-3 py-3 text-texto outline-none focus:border-acento"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-peligro">
              {error}
            </p>
          )}
          <BotonGrande type="submit" disabled={cargando} className="w-full">
            {cargando ? 'Enviando…' : 'Enviar código'}
          </BotonGrande>
        </form>
      ) : (
        <form onSubmit={alVerificarCodigo} className="space-y-4">
          <p className="text-sm text-texto-2">
            Revisa <strong className="text-texto">{email}</strong> y escribe el código
            que te enviamos.
          </p>
          <div>
            <label htmlFor="pa-codigo" className="mb-1 block text-sm font-semibold text-texto">
              Código de 6 dígitos
            </label>
            <input
              id="pa-codigo"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="min-h-touch w-full rounded-card border border-borde bg-tarjeta px-3 py-3 text-center text-2xl tracking-[0.5em] text-texto outline-none focus:border-acento"
              placeholder="000000"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-peligro">
              {error}
            </p>
          )}
          <BotonGrande type="submit" disabled={cargando} className="w-full">
            {cargando ? 'Verificando…' : 'Entrar'}
          </BotonGrande>
          <button
            type="button"
            onClick={() => setPaso('correo')}
            className="w-full rounded-pill border border-borde py-2.5 font-semibold text-texto-2"
          >
            Usar otro correo
          </button>
        </form>
      )}
    </ModalHoja>
  )
}
