// Encabezado de la pantalla Hoy: marca "Conecta2✨" + "Modo Esposo/a", con el
// personaje grande a la derecha y una burbuja con su nombre. Respeta la
// privacidad: en modo él, si la pareja restringió la info, no se muestra la
// fase (se filtra desde la pantalla Hoy).
//
// Los indicadores de conexión/sincronización viven en Ajustes → Pareja (no
// aquí): a este tamaño eran ilegibles y, si fallaban, no había ninguna acción
// disponible para resolverlos desde Hoy.
import Personaje from '../personajes/Personaje.jsx'

export default function EncabezadoHoy({ rol, nombrePersonaje, expresion, accesorios, alTocarPersonaje }) {
  const modo = rol === 'ella' ? 'Modo Esposa 💗' : 'Modo Esposo 💙'

  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="font-titulo text-[2rem] font-extrabold leading-none text-texto">
          Conecta<span className="text-acento">2</span>
          <span aria-hidden="true" className="ml-1 align-top text-lg">✨</span>
        </h1>
        <p className="mt-1 text-sm font-semibold text-texto-2">{modo}</p>
      </div>

      <div className="relative shrink-0">
        {/* Halo animado sutil: da a entender que el personaje es tocable,
            no solo decorativo. Respeta "reducir movimiento" vía CSS. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -m-1.5 animate-[flotar-suave_3s_ease-in-out_infinite] rounded-full bg-acento/15 blur-md"
        />
        <Personaje
          rol={rol}
          tamano={132}
          expresion={expresion}
          accesorios={accesorios}
          alTocar={alTocarPersonaje}
        />
        <span className="absolute -bottom-1 right-0 whitespace-nowrap rounded-pill bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-lg">
          {nombrePersonaje}
        </span>
      </div>
    </header>
  )
}
