// Reformulador de quejas (inicio suave, Gottman). El usuario escribe su queja
// molesta; se detecta el nubarrón y se arma la versión suave con la fórmula
// "Me siento [emoción] cuando [situación], me gustaría [pedido]". Muestra antes
// 🌩️ / después 🌱 lado a lado. Versión estática (fallback sin IA).
import { useState } from 'react'
import { detectarNubarronEstatico, NUBARRONES } from '../../datos/nubarrones.js'

export default function Reformulador() {
  const [queja, setQueja] = useState('')
  const [emocion, setEmocion] = useState('')
  const [situacion, setSituacion] = useState('')
  const [pedido, setPedido] = useState('')
  const [mostrar, setMostrar] = useState(false)

  const nubarronId = queja ? detectarNubarronEstatico(queja) : null
  const nubarron = nubarronId ? NUBARRONES[nubarronId] : null

  const versionSuave =
    emocion && situacion && pedido
      ? `Me siento ${emocion} cuando ${situacion}, me gustaría ${pedido}.`
      : null

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold uppercase text-texto-3">
          ¿Qué querías decir (con rabia)?
        </label>
        <textarea
          value={queja}
          onChange={(e) => {
            setQueja(e.target.value)
            setMostrar(true)
          }}
          placeholder="Ej. nunca me ayudas en nada"
          rows={2}
          className="mt-1 w-full resize-none rounded-xl border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
        />
      </div>

      {mostrar && nubarron && (
        <div className="rounded-xl bg-peligro/10 p-3">
          <p className="text-sm font-bold text-peligro">
            Ojo: eso suena a {nubarron.emoji} {nubarron.nombre}
          </p>
          <p className="text-xs text-texto-2">{nubarron.antidoto}</p>
        </div>
      )}

      <p className="text-sm text-texto-2">
        Ármalo suave. Completa los tres espacios:
      </p>
      <div className="space-y-2">
        <input
          value={emocion}
          onChange={(e) => setEmocion(e.target.value)}
          placeholder="Me siento… (ej. cargada, sola, ignorado)"
          className="w-full rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
        />
        <input
          value={situacion}
          onChange={(e) => setSituacion(e.target.value)}
          placeholder="cuando… (situación específica, sin 'siempre/nunca')"
          className="w-full rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
        />
        <input
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          placeholder="me gustaría… (pedido concreto)"
          className="w-full rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
        />
      </div>

      {(queja || versionSuave) && (
        <div className="grid grid-cols-1 gap-2">
          {queja && (
            <div className="rounded-xl border border-peligro/40 bg-peligro/5 p-3">
              <p className="text-xs font-bold text-peligro">🌩️ Antes</p>
              <p className="text-sm text-texto-2">{queja}</p>
            </div>
          )}
          {versionSuave && (
            <div className="rounded-xl border border-exito/40 bg-exito/5 p-3">
              <p className="text-xs font-bold text-exito">🌱 Después</p>
              <p className="text-sm text-texto">{versionSuave}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
