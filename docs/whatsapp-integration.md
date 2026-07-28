# Integración con WhatsApp

## Filosofía

> Conecta2 prepara la interacción; WhatsApp puede ser el canal donde
> finalmente ocurre la conversación.

La vinculación de pareja es **opcional**. Sin vincular, todas las acciones
(acciones rápidas, mensaje libre, botón de corazón) preparan un mensaje
natural y abren WhatsApp. Con pareja vinculada, WhatsApp sigue siendo la
acción principal; "Enviar por Conecta2" queda como canal secundario.

## Servicios

- `src/servicios/whatsappService.js`: `limpiarTelefono()`, `construirUrl()`
  (`https://wa.me/<num>?text=...`), `abrirWhatsApp()` con fallback en cadena
  **WhatsApp → Web Share API → copiar al portapapeles**.
- `src/datos/mensajesWhatsApp.js`: frases por acción y tono (suave, divertido,
  directo, sin filtro pero respetuoso), con selección **determinista** por
  `(accionId, tono, semilla del día)` — el texto no cambia en cada render.

## Número de la pareja

- Configurable en Ajustes → Comunicación → "WhatsApp de mi pareja".
- Se limpia a formato internacional y se guarda **solo en `localStorage`**
  (`config.whatsappPareja`), **nunca se sincroniza a Supabase por defecto**.
- Es opcional: sin número, WhatsApp se abre para elegir el contacto
  manualmente (`https://wa.me/?text=...`).

## Reglas de honestidad (no negociables)

- La UI muestra siempre **"Mensaje preparado para WhatsApp"**, nunca
  "enviado".
- Nunca se afirma que la pareja **recibió** o **leyó** el mensaje.
- No hay envío automático: el usuario confirma manualmente dentro de
  WhatsApp.
- El registro local (si existe) usa el estado `preparado`, nunca `enviado`.
- La gamificación otorga puntos como **"detalle preparado"**, nunca como
  "mensaje entregado" (ver `usarEnvioInteraccion.js` / `MensajeLibre.jsx`,
  clave anti-spam `detalle_preparado:*`).

## Dónde se usa

- `usarEnvioInteraccion()` (acciones rápidas de `BarraComunicacion` y los
  flujos del centro de interacciones): sin vínculo, cae a `abrirWhatsApp()`
  en vez de bloquear con el modal de vinculación.
- `MensajeLibre.jsx`: sin vínculo, el único botón es "Abrir WhatsApp 💬"; con
  vínculo, ofrece ambos canales.
- `PronosticoSemanal.jsx`: el detalle de cada día ofrece "Preparar mensaje
  para WhatsApp" con el pronóstico de ese día.

## Limitaciones de entrega

No hay forma de confirmar programáticamente que el mensaje se envió o fue
leído dentro de WhatsApp (WhatsApp no expone esa información a apps
externas). Por diseño, Conecta2 no lo intenta simular.

## Tests

`src/servicios/whatsappService.test.js` y `src/datos/mensajesWhatsApp.test.js`
cubren: limpieza de teléfono, codificación del mensaje, apertura con/sin
número, fallback a compartir/copiar, determinismo de frases, y que el
resultado nunca reporte "enviado".
