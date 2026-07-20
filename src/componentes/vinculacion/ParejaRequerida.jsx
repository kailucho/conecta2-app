import ModalHoja from '../comunes/ModalHoja.jsx'

export default function ParejaRequerida({
  abierto,
  motivo = 'sin_pareja_vinculada',
  alCerrar,
  alIrAVinculacion,
}) {
  const errorPersistencia = motivo === 'error_persistencia'
  const titulo = errorPersistencia
    ? 'No pudimos guardar la interacción'
    : 'Vincula a tu pareja para enviarle esto'

  return (
    <ModalHoja abierto={abierto} alCerrar={alCerrar} titulo={titulo}>
      {errorPersistencia ? (
        <div className="space-y-4">
          <p className="text-sm text-texto-2">
            No pudimos guardar la interacción. Inténtalo nuevamente.
          </p>
          <button
            onClick={alCerrar}
            className="w-full rounded-pill bg-acento py-3 font-titulo font-bold text-white"
          >
            Entendido
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-texto-2">
            Cuando estén conectados podrán enviarse estados, cariños, necesidades y
            planes desde la app.
          </p>
          <p className="rounded-xl bg-acento/10 p-3 text-sm text-texto">
            Todavía falta conectar a tu amor 💛
          </p>
          <button
            onClick={alIrAVinculacion}
            className="w-full rounded-pill bg-acento py-3 font-titulo font-bold text-white"
          >
            Ir a vinculación
          </button>
          <button
            onClick={alCerrar}
            className="w-full rounded-pill border border-borde py-2.5 font-semibold text-texto-2"
          >
            Ahora no
          </button>
        </div>
      )}
    </ModalHoja>
  )
}
