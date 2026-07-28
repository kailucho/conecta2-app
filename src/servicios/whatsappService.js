// ============================================================
// whatsappService — capa independiente para PREPARAR y abrir mensajes de
// WhatsApp. Conecta2 nunca envía el mensaje por sí mismo: solo prepara el
// texto y abre WhatsApp; el envío final lo confirma la persona dentro de
// WhatsApp. Por eso la UI debe decir siempre "Mensaje preparado", nunca
// "Mensaje enviado/recibido/leído".
// ============================================================

import { parejaVinculada } from './syncService.js'

/**
 * Decide si una interacción debe ir por WhatsApp: siempre que no haya
 * vinculación (nunca bloquea), y también si SÍ hay vinculación pero el
 * canal predeterminado configurado en Ajustes → Comunicación es 'whatsapp'.
 */
export function debeUsarWhatsApp(perfil, config) {
  return !parejaVinculada(perfil) || config?.canalPredeterminado === 'whatsapp'
}

/**
 * Limpia un número de teléfono a formato internacional (solo dígitos, sin
 * espacios, guiones, paréntesis ni símbolos). No agrega prefijo de país.
 */
export function limpiarTelefono(raw) {
  if (!raw) return ''
  const soloDigitos = String(raw).replace(/[^\d+]/g, '')
  // Quita cualquier '+' que no sea el primero.
  const signo = soloDigitos.startsWith('+') ? '+' : ''
  const digitos = soloDigitos.replace(/\+/g, '')
  return signo + digitos
}

/**
 * Construye la URL de wa.me con el texto codificado. Si hay teléfono, abre
 * directamente esa conversación; si no, abre WhatsApp para elegir contacto.
 */
export function construirUrl({ telefono = '', texto = '' } = {}) {
  const tel = limpiarTelefono(telefono).replace('+', '')
  const query = texto ? `?text=${encodeURIComponent(texto)}` : ''
  return tel ? `https://wa.me/${tel}${query}` : `https://wa.me/${query}`
}

async function copiarAlPortapapeles(texto) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto)
      return { ok: true, canal: 'copiado' }
    }
  } catch {
    // sigue al fallback silencioso
  }
  return { ok: false, canal: 'copiado' }
}

/**
 * Abre WhatsApp con el mensaje preparado. Nunca marca el mensaje como
 * "enviado": solo abre el canal para que la persona lo confirme manualmente.
 *
 * Orden de fallback: WhatsApp (wa.me) → Web Share API → copiar al portapapeles.
 *
 * @returns {Promise<{ok:boolean, canal:'whatsapp'|'compartir'|'copiado', estado:'preparado'}>}
 */
export async function abrirWhatsApp({ telefono = '', texto = '' } = {}) {
  const url = construirUrl({ telefono, texto })

  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    const ventana = window.open(url, '_blank', 'noopener,noreferrer')
    if (ventana) {
      return { ok: true, canal: 'whatsapp', estado: 'preparado' }
    }
  }

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text: texto })
      return { ok: true, canal: 'compartir', estado: 'preparado' }
    } catch {
      // el usuario canceló o no está disponible; sigue al copiado
    }
  }

  const copiado = await copiarAlPortapapeles(texto)
  return { ok: copiado.ok, canal: 'copiado', estado: 'preparado' }
}
