// Registro rápido del ánimo OBSERVADO de la pareja (un tap). Alimenta los
// gráficos de patrones. Incluye 🕳️ "modo cueva" cuando la pareja es él.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { claveDia } from '../../motor/fechas.js'

// La pareja observada es del rol OPUESTO al del usuario.
const EMOJIS_ELLA = ['😊', '😐', '😢', '😠']
const EMOJIS_EL = ['😊', '😐', '😠', '🕳️'] // 🕳️ = modo cueva

export default function RegistroAnimoObservado({ dia, faseId }) {
  const { perfil, registrarAnimoObservado, animoObservado } = usarApp()
  const parejaEsEl = perfil.rol === 'ella'
  const emojis = parejaEsEl ? EMOJIS_EL : EMOJIS_ELLA

  const hoyKey = claveDia(new Date())
  const yaHoy = animoObservado.find(
    (a) => a.fecha === hoyKey && a.observadoPor === perfil.userId,
  )
  const [elegido, setElegido] = useState(yaHoy?.emoji || null)

  async function registrar(emoji) {
    setElegido(emoji)
    await registrarAnimoObservado({
      fecha: hoyKey,
      emoji,
      diaCiclo: dia,
      fase: faseId,
      observadoPor: perfil.userId,
    })
  }

  return (
    <TarjetaBase>
      <p className="mb-2 text-sm font-semibold text-texto-2">
        ¿Cómo ves hoy a {parejaEsEl ? 'tu chico' : 'tu chica'}?
      </p>
      <div className="flex justify-around">
        {emojis.map((e) => (
          <button
            key={e}
            onClick={() => registrar(e)}
            aria-label={`Ánimo ${e}`}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-transform active:scale-90 ${
              elegido === e ? 'bg-acento/20 scale-110 ring-2 ring-acento' : ''
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      {elegido && (
        <p className="mt-2 text-center text-xs text-texto-3">
          Registrado 💾 · esto ayuda a ver patrones con el tiempo
        </p>
      )}
    </TarjetaBase>
  )
}
