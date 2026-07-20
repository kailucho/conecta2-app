// Pantalla de bloqueo por PIN. Se muestra al abrir la app si hay PIN puesto.
import { useState } from 'react'

export default function BloqueoPIN({ pin, nombreApp, onDesbloquear }) {
  const [entrada, setEntrada] = useState('')
  const [error, setError] = useState(false)

  function tecla(n) {
    if (entrada.length >= 4) return
    const nueva = entrada + n
    setEntrada(nueva)
    setError(false)
    if (nueva.length === 4) {
      if (nueva === pin) {
        onDesbloquear()
      } else {
        setError(true)
        setTimeout(() => setEntrada(''), 500)
      }
    }
  }

  function borrar() {
    setEntrada((e) => e.slice(0, -1))
    setError(false)
  }

  return (
    <div className="fondo-app flex min-h-screen flex-col items-center justify-center px-8">
      <div className="mb-6 text-5xl">🔒</div>
      <p className="mb-1 font-titulo text-xl font-bold text-texto">
        {nombreApp || 'Conecta2'}
      </p>
      <p className="mb-6 text-sm text-texto-3">Ingresa tu PIN</p>

      <div className={`mb-8 flex gap-3 ${error ? 'animate-[latido_0.3s]' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${
              i < entrada.length
                ? error
                  ? 'border-peligro bg-peligro'
                  : 'border-acento bg-acento'
                : 'border-borde'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => tecla(String(n))}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-tarjeta text-2xl font-bold text-texto active:scale-90"
          >
            {n}
          </button>
        ))}
        <span />
        <button
          onClick={() => tecla('0')}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-tarjeta text-2xl font-bold text-texto active:scale-90"
        >
          0
        </button>
        <button
          onClick={borrar}
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl text-texto-3 active:scale-90"
          aria-label="Borrar"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
