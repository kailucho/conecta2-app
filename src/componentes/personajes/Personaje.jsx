// Envoltorio que elige el personaje según el rol.
//   rol 'ella' → Estrellita 💗   |   rol 'el' → Astro Azul 💙
// Si se pasa `alTocar`, el personaje se vuelve interactivo (botón accesible);
// sin ella, el render es idéntico al original (decorativo).
import Estrellita from './Estrellita.jsx'
import AstroAzul from './AstroAzul.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'

export default function Personaje({ rol, expresion, tamano, accesorios, alTocar }) {
  const { config } = usarApp()
  const animar = !config.reducirMovimiento

  const svg =
    rol === 'ella' ? (
      <Estrellita expresion={expresion} tamano={tamano} animar={animar} />
    ) : (
      <AstroAzul
        expresion={expresion}
        tamano={tamano}
        animar={animar}
        accesorios={accesorios}
      />
    )

  if (!alTocar) return svg

  return (
    <button
      type="button"
      onClick={alTocar}
      aria-label="Interactuar con tu personaje"
      className="rounded-full transition-transform active:scale-95"
    >
      {svg}
    </button>
  )
}
