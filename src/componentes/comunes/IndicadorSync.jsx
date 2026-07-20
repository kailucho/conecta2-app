// ============================================================
// IndicadorSync — chip discreto de estado de sincronización con la pareja:
// sincronizado / sincronizando / sin conexión / error. Solo se muestra
// cuando hay una pareja vinculada y Supabase está configurado; en modo
// local no aporta nada y se oculta.
// ============================================================
import { useEffect, useState } from 'react'
import { usarApp } from '../../contexto/AppContexto.jsx'
import { parejaVinculada } from '../../servicios/syncService.js'
import { supabaseConfigurado } from '../../servicios/supabaseClient.js'
import { listarOperaciones } from '../../servicios/storageService.js'

const CONFIG_ESTADO = {
  sincronizado: { texto: 'Sincronizado', icono: '✅' },
  sincronizando: { texto: 'Sincronizando…', icono: '🔄' },
  sin_conexion: { texto: 'Sin conexión', icono: '📴' },
  error: { texto: 'No se pudo sincronizar', icono: '⚠️' },
}

export default function IndicadorSync() {
  const { perfil } = usarApp()
  const [estado, setEstado] = useState('sincronizado')

  const activo = supabaseConfigurado && parejaVinculada(perfil)

  useEffect(() => {
    if (!activo) return undefined

    let cancelado = false

    async function recalcular() {
      if (!navigator.onLine) {
        if (!cancelado) setEstado('sin_conexion')
        return
      }
      const cola = await listarOperaciones()
      if (cancelado) return
      if (cola.length === 0) setEstado('sincronizado')
      else if (cola.some((op) => op.lastError)) setEstado('error')
      else setEstado('sincronizando')
    }

    recalcular()
    const intervalo = setInterval(recalcular, 4000)
    window.addEventListener('online', recalcular)
    window.addEventListener('offline', recalcular)

    return () => {
      cancelado = true
      clearInterval(intervalo)
      window.removeEventListener('online', recalcular)
      window.removeEventListener('offline', recalcular)
    }
  }, [activo])

  if (!activo) return null

  const { texto, icono } = CONFIG_ESTADO[estado]

  return (
    <span
      className="inline-flex items-center gap-1 rounded-pill bg-tarjeta px-2 py-0.5 text-[0.65rem] font-semibold text-texto-3"
      aria-live="polite"
      title={texto}
    >
      <span aria-hidden>{icono}</span>
      {texto}
    </span>
  )
}
