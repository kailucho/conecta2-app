// Modal tipo "hoja" que entra desde abajo (bottom sheet). Se cierra tocando el
// fondo, el botón o Escape. Mobile-first y accesible: role="dialog", bloqueo de
// scroll del fondo, foco inicial + restauración y trampa de foco (Tab).
import { useEffect, useId, useRef } from 'react'

const FOCUSABLES =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export default function ModalHoja({ abierto, alCerrar, titulo, children }) {
  const idTitulo = useId()
  const hojaRef = useRef(null)
  const disparadorRef = useRef(null)
  const alCerrarRef = useRef(alCerrar)

  // La función recibida puede cambiar en cada render del contenido (por
  // ejemplo, al escribir en un textarea). Conservamos la versión más reciente
  // sin reiniciar el ciclo de foco y scroll de la hoja.
  alCerrarRef.current = alCerrar

  useEffect(() => {
    if (!abierto) return

    // Recuerda quién tenía el foco para devolvérselo al cerrar.
    disparadorRef.current = document.activeElement

    // Bloquea el scroll del fondo mientras la hoja está abierta.
    const overflowPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Enfoca la hoja al abrir (lector de pantalla + navegación por teclado).
    hojaRef.current?.focus()

    function onKey(e) {
      if (e.key === 'Escape') {
        alCerrarRef.current()
        return
      }
      if (e.key === 'Tab') {
        const focos = hojaRef.current?.querySelectorAll(FOCUSABLES)
        if (!focos || focos.length === 0) {
          e.preventDefault()
          hojaRef.current?.focus()
          return
        }
        const primero = focos[0]
        const ultimo = focos[focos.length - 1]
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault()
          ultimo.focus()
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault()
          primero.focus()
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflowPrevio
      // Devuelve el foco al disparador si sigue en el documento.
      const d = disparadorRef.current
      if (d && typeof d.focus === 'function' && document.contains(d)) d.focus()
    }
  }, [abierto])

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={alCerrar}
    >
      <div
        ref={hojaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo ? idTitulo : undefined}
        aria-label={titulo ? undefined : 'Ventana'}
        tabIndex={-1}
        className="animate-[entrar-hoja_0.3s_ease-out] w-full max-w-lg rounded-t-3xl border-t border-borde bg-fondo-2 area-segura-abajo outline-none"
        style={{ maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-12 rounded-full bg-borde" />
        </div>
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          {titulo && (
            <h3 id={idTitulo} className="font-titulo text-lg font-bold text-texto">
              {titulo}
            </h3>
          )}
          <button
            onClick={alCerrar}
            aria-label="Cerrar"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-tarjeta text-texto-2"
          >
            ✕
          </button>
        </div>
        <div
          className="overflow-y-auto px-5 pb-8"
          style={{ maxHeight: 'calc(88vh - 80px)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
