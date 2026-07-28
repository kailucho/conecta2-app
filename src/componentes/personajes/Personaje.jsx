// Envoltorio que elige el personaje según el rol.
//   rol 'ella' → Estrellita 💗   |   rol 'el' → Astro Azul 💙
// Si se pasa `alTocar`, el personaje se vuelve interactivo (botón accesible);
// sin ella, el render es idéntico al original (decorativo).
//
// Recursos visuales: intenta usar la imagen registrada en
// datos/assetsPersonajes.js; si no existe o falla al cargar, cae
// automáticamente al SVG dibujado en JSX (nunca rompe el render ni muestra
// un ícono de archivo roto). No se elimina el SVG mientras falten imágenes.
import { useEffect, useState } from 'react'
import Estrellita from './Estrellita.jsx'
import AstroAzul from './AstroAzul.jsx'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { assetPersonaje } from '../../datos/assetsPersonajes.js'

export default function Personaje({ rol, expresion, tamano, accesorios, alTocar }) {
  const { config } = usarApp()
  const animar = !config.reducirMovimiento
  const idPersonaje = rol === 'ella' ? 'estrellita' : 'astro'
  const asset = assetPersonaje(idPersonaje, expresion)
  const [errorImagen, setErrorImagen] = useState(false)

  // Si cambia la expresión (nuevo asset), vuelve a intentar la imagen.
  useEffect(() => {
    setErrorImagen(false)
  }, [asset?.archivo])

  const svgFallback =
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

  const contenido =
    asset && !errorImagen ? (
      // Espacio reservado con el tamaño del personaje: evita saltos de layout.
      <span
        style={{ width: tamano, height: tamano }}
        className="inline-flex items-center justify-center"
      >
        <img
          src={asset.archivo}
          alt={asset.alt}
          width={tamano}
          height={tamano}
          loading={alTocar ? 'eager' : 'lazy'}
          style={{ objectFit: 'contain', width: tamano, height: tamano }}
          onError={() => setErrorImagen(true)}
        />
      </span>
    ) : (
      svgFallback
    )

  if (!alTocar) return contenido

  return (
    <button
      type="button"
      onClick={alTocar}
      aria-label="Abrir acciones para tu pareja"
      className="rounded-full transition-transform active:scale-95"
    >
      {contenido}
    </button>
  )
}
