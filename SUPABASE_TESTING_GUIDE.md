# Guía de pruebas manuales — Fase 2 Supabase

Requiere `supabase start` corriendo y `.env.local` configurado
(ver `SUPABASE_SETUP.md`).

```bash
npm install
npm run dev
```

## Preparación: dos "usuarios"

Usa **dos navegadores distintos** (o uno normal + una ventana de incógnito)
para simular a los dos miembros de la pareja, cada uno con su propio correo
de prueba (puedes usar `algo+a@ejemplo.com` / `algo+b@ejemplo.com` si tu
proveedor de correo soporta el "+").

Con Supabase local, los correos de OTP no salen a internet: revisa
**Inbucket** en `http://127.0.0.1:54324` (o el puerto que imprima
`supabase start`) para ver el código de 6 dígitos.

## 1. Autenticación

1. Abre la app en el navegador A → completa el onboarding local (rol, tipo
   de relación, etc. — no pide cuenta todavía).
2. Ve a *Ajustes → Vinculación de pareja* → "Generar código de invitación".
3. Se abre la pantalla de acceso: ingresa el correo A, revisa Inbucket,
   escribe el código de 6 dígitos → deberías quedar autenticado.
4. Repite en el navegador B con el correo B, pero usando "¿Tu pareja te dio
   un código? Ingrésalo aquí" (aparecerá tras iniciar sesión).

## 2. Vinculación

1. En A: genera el código, cópialo (botón "Copiar" o "Compartir").
2. En B: pégalo en el campo de código y pulsa "Unirme".
3. Verifica en ambos navegadores que la tarjeta pase a "Vinculada".
4. **Tercer usuario**: intenta usar el mismo código con un tercer correo →
   debe fallar con "pareja completa".
5. **Código expirado**: genera un código, cambia manualmente `expires_at` en
   `couple_invites` a una fecha pasada (via Studio, `http://127.0.0.1:54323`)
   y confirma que `aceptarInvitacion` devuelve `codigo_expirado`.
6. **Doble pareja**: con un usuario ya vinculado, intenta aceptar otro código
   → debe fallar con `usuario_ya_vinculado`.

## 3. Interacciones

1. En A: usa cualquier acción rápida (Centro de interacciones) o la tarjeta
   "Dile algo a tu amor".
2. En B: la interacción debe aparecer en la Bandeja de pareja **sin
   recargar** (Realtime).
3. En B: responde/reconoce la interacción con una de las respuestas
   sugeridas.
4. En A: la actualización de estado debe reflejarse (puedes confirmarlo en
   Studio → tabla `interactions`, columna `status`/`responded_at`).
5. **Cancelar**: llama `cancelarInteraccion(id)` desde la consola del
   navegador (`window`) o añade un botón temporal — confirma que
   `status` pasa a `cancelled` en Supabase.

## 4. Offline → online

1. En A, con DevTools abiertas, ve a la pestaña Network y marca "Offline".
2. Envía una interacción → debe aparecer localmente de inmediato; el chip
   de sincronización (junto al nivel, en la pantalla Hoy) debe mostrar "Sin
   conexión".
3. Quita el modo offline → el chip debe pasar a "Sincronizando…" y luego a
   "Sincronizado"; verifica en Studio que la fila llegó **una sola vez**
   (sin duplicados) aunque hayas recargado la página mientras estaba offline.

## 5. Cierre y reapertura de la PWA

1. Cierra sesión desde donde corresponda (o simplemente cierra la pestaña).
2. Vuelve a abrir la app: la sesión debe restaurarse sola (sin pedir OTP de
   nuevo) gracias a `persistSession`.
3. Verifica que ya no lleguen actualizaciones Realtime tras cerrar sesión
   (revisa que no haya errores de canal en la consola).

## 6. Aislamiento entre parejas (RLS)

1. Crea una tercera cuenta C, sin vincular con nadie.
2. Desde la consola del navegador, intenta leer `interactions` de la pareja
   A-B autenticado como C:
   ```js
   const { data, error } = await supabase.from('interactions').select('*')
   ```
   `data` debe salir vacío (RLS bloquea el acceso), no un error genérico.

## 7. Privacidad del ciclo

El módulo de ciclo compartido (`cycle_shared_snapshots`, sugerencias de
periodo) **no** está incluido en este núcleo — ver limitaciones en
`FASE_2_IMPLEMENTATION_SUMMARY.md`. Los datos de ciclo siguen siendo
100% locales por ahora, así que no hay nada que probar aquí todavía.

## Checklist rápido (correspondencia con los 20 criterios de aceptación)

- [ ] A inicia sesión con OTP
- [ ] B inicia sesión con OTP
- [ ] A genera código, B lo ingresa, ambos quedan vinculados
- [ ] A envía interacción → B la recibe sin recargar
- [ ] B responde → A ve la actualización
- [ ] A offline envía interacción → aparece "pendiente" localmente
- [ ] A recupera conexión → se sincroniza sin duplicarse
- [ ] Un tercer usuario no puede leer los datos de la pareja
- [ ] Cerrar sesión detiene las suscripciones Realtime
