// Insights de patrones — análisis semanal de los registros con observaciones
// honestas y con humor. Con IA genera el análisis; sin IA, un resumen simple.
// Nunca culpa ni atribuye todo a las hormonas.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { askAI } from '../../servicios/aiService.js'
import { balanceReciente } from '../../motor/conexion.js'

export default function Insights() {
  const { animoObservado, interacciones } = usarApp()
  const [texto, setTexto] = useState(null)
  const [fuente, setFuente] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function analizar() {
    setCargando(true)
    const balance = balanceReciente(interacciones, 7)
    const r = await askAI('insights', {
      datos: {
        registrosAnimo: animoObservado.slice(0, 30),
        gestosPositivos: balance.positivas,
        discusiones: balance.negativas,
      },
    })
    setTexto(r.texto)
    setFuente(r.fuente)
    setCargando(false)
  }

  const suficientes = animoObservado.length >= 4 || interacciones.length >= 4

  return (
    <TarjetaBase>
      <p className="mb-1 font-titulo font-bold text-texto">🔍 Insights de la semana</p>
      <p className="mb-3 text-xs text-texto-3">
        Un vistazo honesto y con humor a sus patrones. Solo para entenderse
        mejor, nunca para culparse.
      </p>

      {!suficientes ? (
        <p className="rounded-xl bg-tarjeta-hover p-3 text-sm text-texto-2">
          Junta unos días más de registros y acá te muestro patrones útiles 💙
        </p>
      ) : (
        <>
          <button
            onClick={analizar}
            disabled={cargando}
            className="w-full rounded-pill bg-acento py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {cargando ? 'Analizando…' : texto ? 'Analizar de nuevo 🔄' : 'Ver mis insights'}
          </button>
          {texto && (
            <div className="mt-3 animate-aparecer rounded-xl bg-tarjeta-hover p-3">
              <p className="whitespace-pre-line text-sm text-texto">{texto}</p>
              {fuente === 'fallback' && (
                <p className="mt-2 text-xs text-texto-3">
                  💡 Análisis básico offline. Activa la IA para insights más finos.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </TarjetaBase>
  )
}
