// ============================================================
// instalacionPWA — captura el evento beforeinstallprompt para poder ofrecer
// "Agregar a pantalla de inicio" de forma amable tras el onboarding.
// ============================================================

let promptDiferido = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    promptDiferido = e
  })
}

/**
 * ¿Hay un prompt de instalación disponible?
 */
export function puedeInstalar() {
  return promptDiferido !== null
}

/**
 * Lanza el prompt nativo de instalación. Devuelve true si el usuario aceptó.
 */
export async function instalar() {
  if (!promptDiferido) return false
  promptDiferido.prompt()
  const { outcome } = await promptDiferido.userChoice
  promptDiferido = null
  return outcome === 'accepted'
}

/**
 * ¿La app ya está corriendo como instalada (standalone)?
 */
export function estaInstalada() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}
