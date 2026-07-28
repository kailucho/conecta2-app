# Notificaciones — resumen matutino (Niveles 1-3)

## Nivel 1 — app abierta (siempre activo)

`src/servicios/notificaciones.js`:

- `debeMostrarResumenHoy(resumenMatutino, ahora)` — función pura que decide
  si corresponde mostrar el resumen: preferencia activa, día de la semana
  habilitado, fines de semana, hora ya alcanzada (respetando
  `zonaHoraria`, con fallback al reloj local) y que no se haya mostrado ya
  hoy (`ultimaFecha`).
- `contenidoResumenMatutino(pronosticoHoy, resumenMatutino)` — construye
  título/cuerpo. Si `contenidoSensible === false`, el texto es genérico
  ("Conecta2 tiene listo tu resumen de hoy.") sin mencionar el ciclo.
- `mostrarResumenMatutinoSiCorresponde(...)` — efecto: llama a `notificar()`
  y persiste `ultimaFecha` para evitar duplicados. Se dispara desde un
  `useEffect` en `App.jsx` cada vez que la app se abre.

No requiere Supabase ni permisos especiales más allá de `Notification`. No
se pide permiso de notificaciones automáticamente: solo tras el botón
explícito "Activar resumen de la mañana" en Ajustes.

## Nivel 2 — Web Push (cliente)

- El Service Worker cambió de estrategia `generateSW` a **`injectManifest`**
  (`src/sw.js`), agregando handlers `push` y `notificationclick` sin perder
  precache/offline/autoUpdate/fallback de navegación (ver `vite.config.js`).
- `src/servicios/pushService.js`: `suscribirPush()` registra la
  `PushSubscription` del navegador con la clave pública VAPID
  (`VITE_VAPID_PUBLIC_KEY`) y la guarda en `push_subscriptions` (Supabase).
  `revocarPush()` la elimina local y remotamente.
- Se ofrece en Ajustes → Notificaciones, solo si `supabaseConfigurado` y el
  navegador soporta Push (`pushSoportado()`). En modo local, este nivel no
  aparece; el Nivel 1 sigue funcionando igual.

## Nivel 3 — envío programado (servidor)

`supabase/functions/notificaciones-push/index.ts`: Edge Function que, por
cada usuario con `notification_preferences.activo = true`, calcula hora/día
local, evita reenvíos con `notification_deliveries` (unique
`user_id, fecha`), y envía Web Push (librería `web-push`) a cada
`push_subscriptions` del usuario. Elimina suscripciones que respondan
404/410 (expiradas/inválidas). Usa las claves VAPID **solo como secretos de
servidor**, nunca en el frontend.

## Migraciones nuevas

- `0015_push_subscriptions.sql` — una fila por endpoint de navegador, RLS
  self-only, `unique(endpoint)`.
- `0016_notification_preferences.sql` — espejo servidor de
  `config.resumenMatutino` (hora, días, zona horaria, flags), RLS self-only.
  No guarda contenido sensible.
- `0017_notification_deliveries.sql` — registro de entregas para
  idempotencia, `unique(user_id, fecha)`, solo lectura para el cliente
  (la Edge Function escribe con la service role key).

## Configuración manual pendiente (no automatizable desde el repo)

1. **Generar par de claves VAPID**:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Poner la **clave pública** en `.env.local` como `VITE_VAPID_PUBLIC_KEY`.
3. En Supabase → Project Settings → Edge Functions → Secrets, configurar:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (ej. `mailto:soporte@tudominio.com`)
4. Aplicar las migraciones 0015–0017 (`supabase db push` o `supabase db reset`
   en local) y desplegar la función:
   ```bash
   supabase functions deploy notificaciones-push
   ```
5. **Scheduler**: configurar una invocación periódica (cada 10-15 min) de la
   función, por ejemplo con `pg_cron` + `pg_net` desde el SQL Editor de
   Supabase:
   ```sql
   select cron.schedule(
     'resumen-matutino',
     '*/15 * * * *',
     $$
     select net.http_post(
       url := 'https://<project-ref>.functions.supabase.co/notificaciones-push',
       headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
     );
     $$
   );
   ```
   (Alternativa: Supabase Scheduled Functions desde el Dashboard, si está
   disponible en el plan del proyecto.) Esto no se incluye como migración
   porque requiere el secreto de service role, que no debe vivir en el repo.
6. Los usuarios conceden el permiso del navegador solo al pulsar "Activar
   notificaciones push (beta)" en Ajustes.

## Prueba manual

- Nivel 1: Ajustes → Notificaciones → "Probar notificación" (fuerza el envío
  ignorando `ultimaFecha`).
- Nivel 2/3: tras configurar VAPID y desplegar la función, invocarla a mano:
  ```bash
  curl -X POST https://<project-ref>.functions.supabase.co/notificaciones-push \
    -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
  ```
  y confirmar que llega la notificación del sistema con la app cerrada.

## Tests

`src/servicios/notificaciones.test.js` cubre: preferencia desactivada, día
habilitado/deshabilitado, hora, zona horaria, idempotencia diaria, contenido
discreto/sensible, y fines de semana.
