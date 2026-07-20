// Test "¿cuál es tu nubarrón?" — autoevaluación opcional. El resultado se
// guarda en el perfil y personaliza los tips del SOS.
import { useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { TEST_NUBARRON, resultadoTest, NUBARRONES } from '../../datos/nubarrones.js'
import Nubarron from './Nubarron.jsx'

export default function TestNubarron() {
  const { perfil, guardarPerfil } = usarApp()
  const [iniciado, setIniciado] = useState(false)
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState([])
  const yaHecho = perfil.nubarronDebil

  function responder(nubarron) {
    const nuevas = [...respuestas, nubarron]
    if (paso + 1 < TEST_NUBARRON.preguntas.length) {
      setRespuestas(nuevas)
      setPaso(paso + 1)
    } else {
      const resultado = resultadoTest(nuevas)
      guardarPerfil({ ...perfil, nubarronDebil: resultado })
      setRespuestas(nuevas)
      setPaso(TEST_NUBARRON.preguntas.length) // pantalla de resultado
    }
  }

  function reiniciar() {
    setPaso(0)
    setRespuestas([])
    setIniciado(true)
  }

  // Resultado (guardado previamente o recién terminado).
  const mostrarResultado =
    paso >= TEST_NUBARRON.preguntas.length && respuestas.length > 0
  const idResultado = mostrarResultado
    ? resultadoTest(respuestas)
    : yaHecho

  if (!iniciado && !yaHecho) {
    return (
      <div>
        <p className="mb-3 text-sm text-texto-2">{TEST_NUBARRON.intro}</p>
        <button
          onClick={() => setIniciado(true)}
          className="w-full rounded-pill bg-acento py-2.5 text-sm font-bold text-white active:scale-[0.98]"
        >
          Empezar test (4 preguntas)
        </button>
      </div>
    )
  }

  if ((mostrarResultado || (yaHecho && !iniciado)) && idResultado) {
    const n = NUBARRONES[idResultado]
    return (
      <div className="animate-aparecer text-center">
        <div className="flex justify-center">
          <Nubarron color={n.color} emoji={n.emoji} tamano={90} />
        </div>
        <p className="mt-2 font-titulo text-lg font-bold text-texto">
          Tu nubarrón a vigilar: {n.emoji} {n.nombre}
        </p>
        <p className="mt-1 text-sm text-texto-2">{n.ataca}</p>
        <div className="mt-3 rounded-xl bg-exito/10 p-3 text-left">
          <p className="text-sm font-bold text-exito">Tu antídoto:</p>
          <p className="text-sm text-texto-2">{n.antidoto}</p>
          <p className="mt-1 text-sm text-texto-2">{n.antidotoEjemplo}</p>
        </div>
        <p className="mt-2 text-xs text-texto-3">
          Personalizamos los consejos del SOS con esto. No es una etiqueta, es
          algo para trabajar 💙
        </p>
        <button onClick={reiniciar} className="mt-3 text-sm text-acento underline">
          Volver a hacer el test
        </button>
      </div>
    )
  }

  // Pregunta actual.
  const pregunta = TEST_NUBARRON.preguntas[paso]
  return (
    <div className="animate-aparecer">
      <p className="mb-1 text-xs text-texto-3">
        Pregunta {paso + 1} de {TEST_NUBARRON.preguntas.length}
      </p>
      <p className="mb-3 font-titulo font-bold text-texto">{pregunta.texto}</p>
      <div className="space-y-2">
        {pregunta.opciones.map((o, i) => (
          <button
            key={i}
            onClick={() => responder(o.nubarron)}
            className="w-full rounded-card border border-borde bg-tarjeta p-3 text-left text-sm text-texto-2 transition-all active:scale-[0.99] hover:border-acento"
          >
            {o.texto}
          </button>
        ))}
      </div>
    </div>
  )
}
