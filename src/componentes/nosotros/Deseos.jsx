// Lista de Deseos 💝 compartida: cada uno agrega deseos con categoría; el otro
// los ve en su "Bóveda de Ideas". Se marcan cumplidos (+50 pts). Modo sorpresa
// 🤫 no notifica al cumplirse.
//
// Fase 1 (un rol por instalación): el usuario agrega sus deseos; los de la
// pareja llegarán al vincular cuentas (Fase 2). Se muestran separados.
import { useState } from 'react'
import TarjetaBase from '../comunes/TarjetaBase.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { usarPuntos } from '../../contexto/usarPuntos.js'
import { generarId } from '../../servicios/storageService.js'

const CATEGORIAS = [
  { id: 'regalo', emoji: '🎁', label: 'Regalo' },
  { id: 'antojo', emoji: '🍫', label: 'Antojo' },
  { id: 'lugar', emoji: '📍', label: 'Lugar' },
  { id: 'experiencia', emoji: '✨', label: 'Experiencia' },
]

export default function Deseos() {
  const { perfil, nosotros, actualizarNosotros } = usarApp()
  const { otorgar } = usarPuntos()
  const deseos = nosotros.deseos || []
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('regalo')
  const [sorpresa, setSorpresa] = useState(false)

  const mios = deseos.filter((d) => d.autorId === perfil.userId)
  const dePareja = deseos.filter((d) => d.autorId !== perfil.userId)

  async function agregar() {
    if (!texto.trim()) return
    const deseo = {
      id: generarId(),
      autorId: perfil.userId,
      categoria,
      texto: texto.trim(),
      cumplido: false,
      modoSorpresa: sorpresa,
    }
    await actualizarNosotros({ deseos: [deseo, ...deseos] })
    setTexto('')
    setSorpresa(false)
  }

  async function cumplir(id) {
    await actualizarNosotros({
      deseos: deseos.map((d) => (d.id === id ? { ...d, cumplido: true } : d)),
    })
    await otorgar(50, `deseo:${id}`)
  }

  async function eliminar(id) {
    await actualizarNosotros({ deseos: deseos.filter((d) => d.id !== id) })
  }

  function emojiCat(id) {
    return CATEGORIAS.find((c) => c.id === id)?.emoji || '💝'
  }

  return (
    <TarjetaBase>
      <p className="mb-1 font-titulo font-bold text-texto">💝 Lista de Deseos</p>
      <p className="mb-3 text-xs text-texto-3">
        Agrega lo que te gustaría. Tu pareja los verá en su Bóveda de Ideas.
      </p>

      {/* Agregar */}
      <div className="rounded-xl bg-tarjeta-hover p-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej. una salida a la campiña"
          className="w-full rounded-pill border border-borde bg-tarjeta px-3 py-2 text-sm text-texto"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoria(c.id)}
              className={`rounded-pill border px-2 py-1 text-xs transition-all ${
                categoria === c.id
                  ? 'border-acento bg-acento text-white'
                  : 'border-borde text-texto-2'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-texto-2">
            <input
              type="checkbox"
              checked={sorpresa}
              onChange={(e) => setSorpresa(e.target.checked)}
            />
            🤫 Modo sorpresa (no avisa al cumplirse)
          </label>
          <button
            onClick={agregar}
            className="rounded-pill bg-acento px-4 py-1.5 text-sm font-bold text-white"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Mis deseos */}
      {mios.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-bold uppercase text-texto-3">Mis deseos</p>
          <ul className="space-y-2">
            {mios.map((d) => (
              <li
                key={d.id}
                className={`flex items-center gap-2 rounded-xl border border-borde p-2 text-sm ${
                  d.cumplido ? 'opacity-60' : ''
                }`}
              >
                <span>{emojiCat(d.categoria)}</span>
                <span className={`flex-1 text-texto ${d.cumplido ? 'line-through' : ''}`}>
                  {d.texto} {d.modoSorpresa && '🤫'}
                </span>
                <button onClick={() => eliminar(d.id)} className="text-xs text-texto-3">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bóveda de ideas (deseos de la pareja) */}
      <div className="mt-4">
        <p className="mb-1 text-xs font-bold uppercase text-texto-3">
          🗝️ Bóveda de Ideas (de tu pareja)
        </p>
        {dePareja.length > 0 ? (
          <ul className="space-y-2">
            {dePareja.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-2 rounded-xl border border-borde p-2 text-sm"
              >
                <span>{emojiCat(d.categoria)}</span>
                <span className={`flex-1 text-texto ${d.cumplido ? 'line-through opacity-60' : ''}`}>
                  {/* Modo sorpresa: se puede ver el deseo, pero cumplirlo no avisa */}
                  {d.texto}
                </span>
                {!d.cumplido && (
                  <button
                    onClick={() => cumplir(d.id)}
                    className="rounded-pill bg-acento/20 px-2 py-1 text-xs font-bold text-acento"
                  >
                    ✓ Cumplir +50
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-tarjeta-hover p-3 text-xs text-texto-3">
            Cuando vinculen sus cuentas (próximamente), acá verás los deseos de
            tu pareja para sorprenderle 💫
          </p>
        )}
      </div>
    </TarjetaBase>
  )
}
