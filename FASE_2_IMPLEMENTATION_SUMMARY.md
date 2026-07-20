# Fase 2 — Resumen de implementación (núcleo Supabase)

Alcance ejecutado: **núcleo completo** — Auth OTP, perfiles, vinculación de
pareja, interacciones, cola offline y Realtime, con RLS estricta en todas
las tablas. El módulo de ciclo compartido/gamificación por eventos/Edge
Function de IA quedan para la siguiente etapa (ver "Limitaciones").
UI/UX conservado tal cual salvo los ajustes mínimos indicados en el plan
aprobado (login OTP, indicador de sync, ampliación de la tarjeta de
vinculación).

## Qué se implementó

- **Auth sin contraseña** (email + OTP de 6 dígitos) vía Supabase Auth, con
  sesión persistente y escucha de cambios de sesión.
- **Perfiles**: sincronización entre el perfil local (español/camelCase) y
  la tabla `profiles` (inglés/snake_case), con `legacy_local_user_id` para
  poder migrar datos previos a la cuenta.
- **Vinculación de pareja**: generación de código, unión con código, salida
  de pareja y revocación de invitaciones — todo vía funciones RPC
  `SECURITY DEFINER`, nunca por inserts directos del frontend.
- **Interacciones**: envío, respuesta/reconocimiento y cancelación,
  reflejadas primero en local y sincronizadas a Supabase con `upsert`
  idempotente por `id`.
- **Cola offline enriquecida**: reintentos, backoff exponencial, límite de
  intentos, deduplicación y bloqueo anti-concurrencia; se drena al iniciar,
  al volver la conexión (`online`) y al volver la PWA a primer plano.
- **Migración desde localStorage**: versionada e idempotente, asocia el
  perfil local al `auth.uid()` sin borrar nada del dispositivo.
- **Realtime**: suscripción a `interactions` filtrada por la pareja activa,
  con fusión deduplicada en la caché local y limpieza del canal al cambiar
  de pareja/cerrar sesión/desmontar.
- **RLS estricta** en `profiles`, `couples`, `couple_members`,
  `couple_invites` e `interactions` — ver comentarios en cada migración.
- **Indicador de sincronización** discreto (sincronizado / sincronizando /
  sin conexión / error), visible solo cuando hay pareja vinculada.
- **Modo local preservado**: sin `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_PUBLISHABLE_KEY`, la app sigue funcionando exactamente como
  en Fase 1 (la app nunca queda en blanco).

## Archivos creados

**Servicios**: `src/servicios/supabaseClient.js`, `authService.js`,
`profileService.js`, `coupleService.js`, `interactionRepository.js`,
`colaOffline.js`, `migracionLocal.js`.

**Contexto**: `src/contexto/AuthContexto.jsx`.

**UI**: `src/componentes/auth/PantallaAcceso.jsx`,
`src/componentes/comunes/IndicadorSync.jsx`.

**SQL**: `supabase/config.toml`,
`supabase/migrations/0001_profiles.sql`,
`0002_couples_invites.sql`, `0003_interactions.sql`, `0004_rpc.sql`,
`0005_rls.sql`, `0006_realtime.sql`.

**Pruebas**: `src/servicios/interactionRepository.test.js`,
`colaOffline.test.js`, `migracionLocal.test.js`, `coupleService.test.js`
(nuevos); ampliado `storageService.test.js`.

**Documentación**: `FASE_2_SUPABASE_PLAN.md`, `SUPABASE_SETUP.md`,
`SUPABASE_TESTING_GUIDE.md`, este archivo, `README.md`.

## Archivos modificados

- `src/main.jsx` — envuelto con `ProveedorAuth`.
- `src/contexto/AppContexto.jsx` — envío/respuesta/cancelación encolan
  operaciones offline; hidratación drena la cola pendiente; suscripción
  Realtime a la pareja activa; nueva acción `cancelarInteraccion`.
- `src/servicios/storageService.js` — cola de operaciones (`CLAVES.colaOperaciones`),
  control de migración (`CLAVES.migracion`), `cancelarInteraccion`.
- `src/servicios/syncService.js` — `vinculacionDisponible()` refleja si
  Supabase está configurado en vez de devolver `false` siempre.
- `src/componentes/ajustes/InvitarPareja.jsx` — flujo real de generar/unirse/
  salir de pareja, reemplazando el texto estático "próximamente".
- `src/componentes/comunes/EncabezadoHoy.jsx` — monta `IndicadorSync`.
- `.env.example` — variables de Supabase añadidas.
- `src/app.smoke.test.jsx`, `src/servicios/syncService.test.js` — adaptados
  al nuevo `ProveedorAuth` / redacción de `vinculacionDisponible`.

## Migraciones SQL

`0001_profiles` → `0006_realtime`, aplicadas en orden con
`supabase db reset` (local) o `supabase db push` (remoto). Cada archivo
incluye comentarios `comment on table/function` explicando su propósito y
restricciones de seguridad.

## Funciones RPC

`create_couple_invite()`, `accept_couple_invite(code)`,
`revoke_couple_invite(invite_id)`, `leave_couple()` — todas
`SECURITY DEFINER`, validan estado server-side (vigencia, uso, revocación,
límite de miembros, doble vinculación) y son el único camino para escribir
en `couple_members`.

## Políticas RLS

Resumen (detalle y comentarios en `0005_rls.sql`):
- `profiles`: lectura propia + de la pareja activa; escritura solo propia.
- `couples` / `couple_members`: lectura solo para miembros activos; sin
  insert/update/delete para el rol `authenticated` (solo RPC).
- `couple_invites`: lectura solo para el creador.
- `interactions`: lectura si eres emisor o receptor **y** miembro activo de
  la pareja; el emisor solo puede crear/cancelar, el receptor solo
  reconocer/responder.

## Edge Functions

No implementadas en este núcleo. La IA sigue llamando a Anthropic
directamente desde el navegador con `VITE_ANTHROPIC_API_KEY` — ver
"Limitaciones".

## Pruebas ejecutadas

`npm test` → **20 archivos, 115 pruebas, todas en verde** (23 pruebas
nuevas para los servicios de Fase 2: mapeo de interacciones, envío/
respuesta/cancelación remota, deduplicación y reintentos de la cola
offline, migración idempotente, y las funciones RPC de pareja incluyendo
código expirado/pareja completa/doble vinculación).

Cobertura manual (no automatizable sin un proyecto Supabase corriendo):
ver checklist de `SUPABASE_TESTING_GUIDE.md` para los flujos de dos
navegadores, offline→online, Realtime y aislamiento por RLS.

## Resultados del build

`npm run build` verde después de cada etapa (1 a 5) y en el estado final.
Advertencia preexistente de Vite sobre el tamaño del chunk principal
(~550 kB) — no introducida por esta fase, no bloqueante.

## Decisiones técnicas

- El `id` de cada interacción se genera en el cliente (`generarId()`, ya
  existente) para permitir `upsert` idempotente y evitar duplicados entre
  la cola offline y Realtime.
- `syncState` (pending/syncing/synced/failed) vive solo en la cola local;
  el `status` funcional en Supabase (`active/acknowledged/cancelled/expired`)
  nunca se mezcla con eso, tal como pedía el plan.
- El código de invitación se guarda como hash SHA-256
  (`couple_invites.code_hash`); el texto plano solo se devuelve una vez al
  creador desde `create_couple_invite()`.
- `AppContexto` no depende reactivamente de `AuthContexto` — usa
  `supabaseConfigurado` (import estático) y los campos ya presentes en
  `perfil` (`coupleId`, `partnerId`, `estadoVinculacion`). Esto evita
  acoplar los dos contextos y mantiene intacto el comportamiento 100% local
  cuando no hay sesión.
- `InvitarPareja.jsx` dispara `upsertPerfil` antes de generar/aceptar un
  código para asegurar que el perfil remoto exista antes de que las RLS de
  `interactions` dependan de la pertenencia a `couple_members`.

## Fase 2b — completada

Sobre el núcleo anterior, se cerraron 4 de las 5 limitaciones que quedaban
pendientes:

1. **Edge Function de IA** (`supabase/functions/ai/index.ts`, Deno): valida
   el JWT del usuario, limita `tarea` a las 5 claves permitidas, valida
   longitud del mensaje, lee `ANTHROPIC_API_KEY` desde los secretos del
   servidor y nunca expone el error interno al cliente.
   `src/servicios/aiService.js` ahora llama a
   `supabase.functions.invoke('ai', {...})` en vez de hacer `fetch` directo
   a Anthropic; `VITE_ANTHROPIC_API_KEY` se eliminó de `.env.example` y ya
   **no aparece en el bundle** (verificado con `grep -r ANTHROPIC dist/assets/*.js`
   tras el build, sin resultados). Los fallbacks estáticos y el toggle
   `config.iaActiva` siguen intactos; los 4 consumidores
   (`Traductor.jsx`, `GeneradorMensajes.jsx`, `Insights.jsx`, `ChatSOS.jsx`)
   no cambiaron. Pruebas: `src/servicios/aiService.test.js` (7 casos).
2. **Ciclo compartido**: migración `0007_cycle_sharing.sql`
   (`cycle_shared_snapshots`, `period_suggestions`, RPC
   `respond_period_suggestion`). El ciclo crudo sigue siendo 100% local; solo
   se sube un snapshot ya filtrado según `hormonal_privacy`
   (`src/servicios/cycleShareService.js:derivarSnapshot`), publicado
   automáticamente tras cada `actualizarCiclo` en `AppContexto.jsx` cuando
   hay pareja vinculada. Se añadió `SugerenciaRegla.jsx` (visible en Hoy,
   sin alterar el resto de la pantalla): en modo `el` permite avisar una
   posible fecha, y en modo `ella` permite aceptar/rechazar — aceptar
   escribe el registro **localmente** en el dispositivo de la propietaria,
   nunca desde el servidor. Pruebas:
   `src/servicios/cycleShareService.test.js` (7 casos, incluyendo que
   `solo_alertas` nunca exponga fase ni día).
3. **Gamificación por eventos**: migración `0008_point_events.sql`
   (`point_events`, RPC `award_points` con una tabla fija de puntos por
   `event_type` en el servidor — el cliente nunca decide el valor).
   `src/contexto/usarPuntos.js` sigue calculando y guardando localmente
   primero (offline-first intacto) y, si hay pareja vinculada, registra el
   evento en paralelo; `AppContexto.jsx` reconcilia el total local con la
   suma remota al vincularse (nunca resta, solo adopta el mayor). Pruebas:
   `src/servicios/gamificationRepository.test.js` (4 casos).
4. **Code-splitting**: `vite.config.js` separa `react`/`react-dom` y
   `@supabase/supabase-js` en chunks `vendor-*`; `Guia.jsx` y `FlujoSOS.jsx`
   (ambos con IA, alcanzables solo desde "Más"/SOS) y `Insights.jsx` pasaron
   a `React.lazy` + `Suspense`. El chunk principal bajó de **~553 kB a
   ~169 kB** — la advertencia de Vite sobre chunks >500 kB desapareció.

**Migraciones nuevas (Fase 2b)**: `0007_cycle_sharing.sql`, `0008_point_events.sql`.
**Migraciones nuevas (Fase 2c, fixes)**: `0009_fix_couple_members_rls.sql`,
`0010_grants.sql`, `0011_fix_ambiguous_couple_id.sql`,
`0012_fix_search_path_extensions.sql`, `0013_fix_ambiguous_on_conflict.sql`.
Todas aplicadas y probadas contra Supabase local real (`supabase db reset`).

**Edge Functions**: `supabase/functions/ai/index.ts` (nueva).

**Pruebas**: `npm test` → **23 archivos, 134 pruebas, todas en verde**
(19 nuevas: `aiService.test.js`, `cycleShareService.test.js`,
`gamificationRepository.test.js`). `npm run build` sin advertencias.

## Fase 2c — correcciones tras probar contra Supabase local real

Las pruebas manuales del núcleo (Auth OTP + vinculación) contra
`supabase start` revelaron 4 bugs reales que solo se manifiestan con una
base de datos real (no los detectan los mocks de Vitest). Todos corregidos
con migraciones nuevas, sin tocar las migraciones ya aplicadas:

1. **Recursión infinita en RLS de `couple_members`** (`42P17`): la política
   de `SELECT` original hacía una subconsulta sobre la propia tabla
   `couple_members`, y Postgres reevaluaba esa misma política para resolver
   la subconsulta, indefinidamente. Fix en `0009_fix_couple_members_rls.sql`:
   función `es_miembro_activo(couple_id)` `SECURITY DEFINER` que consulta
   la tabla sin pasar de nuevo por RLS (patrón estándar de Supabase para
   este caso).
2. **Faltaban los `GRANT` de tabla para `authenticated`** (`permission
   denied for table ...`): las migraciones originales nunca concedieron
   `SELECT/INSERT/UPDATE` explícitos — solo permisos por defecto
   (`REFERENCES/TRIGGER/TRUNCATE`). RLS nunca llegaba a evaluarse porque
   Postgres rechazaba la consulta antes. Fix en `0010_grants.sql`.
3. **Columna `couple_id` ambigua** (`42702`, "column reference couple_id is
   ambiguous"): `create_couple_invite()` y `accept_couple_invite()`
   declaran `couple_id` como columna de su `RETURNS TABLE`, lo que la
   convierte en variable de salida implícita dentro del cuerpo de la
   función — cualquier referencia sin calificar a `couple_members.couple_id`
   o `couple_invites.couple_id` queda ambigua. Fix en
   `0011_fix_ambiguous_couple_id.sql`: alias de tabla en todas las
   referencias.
4. **`gen_random_bytes()`/`digest()` no encontradas** (`42883`): en
   Supabase, `pgcrypto` se instala en el esquema `extensions`, no en
   `public`. Las funciones RPC fijan `search_path = public` por seguridad,
   lo que también excluye `extensions`. Fix en
   `0012_fix_search_path_extensions.sql`: `search_path = public, extensions`
   en las dos funciones que usan pgcrypto.
5. **`ON CONFLICT (couple_id, user_id)` también ambiguo** (`42702`): el
   mismo problema del punto 3 reaparece en la cláusula `ON CONFLICT` de
   `accept_couple_invite()` — ahí no se puede resolver con un alias de
   tabla (la lista de columnas del conflicto no admite alias). Fix en
   `0013_fix_ambiguous_on_conflict.sql`: usar
   `ON CONFLICT ON CONSTRAINT couple_members_pkey` en vez de
   `ON CONFLICT (couple_id, user_id)`, lo que evita la referencia ambigua
   por completo. Verificado end-to-end con dos usuarios de prueba
   insertados directamente en `auth.users` (código generado por A, aceptado
   por B, ambos quedaron como `couple_members` activos).
6. **Faltaba forma de cancelar una invitación propia sin pareja**: si un
   usuario generaba su propio código (quedando como único miembro de una
   pareja "pendiente") y luego quería unirse al código de otra persona, no
   había manera de salir — `alSalir` en `InvitarPareja.jsx` solo se
   mostraba cuando `estadoVinculacion === 'vinculada'`, nunca en
   `'pendiente'`. Se agregó el botón "Cancelar mi código y unirme con otro",
   visible también en estado pendiente, que reutiliza `salirPareja()`
   (`leave_couple()` ya soportaba este caso, solo faltaba exponerlo en la UI).

Además, dos ajustes de configuración/DX (no bugs de código):

- **Plantilla de correo OTP**: por defecto Supabase envía un enlace mágico,
  no el código de 6 dígitos que la UI pide escribir. Se agregó
  `supabase/templates/magic_link.html` (usa `{{ .Token }}`) y la referencia
  en `supabase/config.toml` (`[auth.email.template.magic_link]`).
- **`.env.test`**: al crear `.env.local` para desarrollo, `npm test` empezó
  a leerlo también (Vite carga `.env.local` para todos los modos) y
  `supabaseConfigurado` pasaba a `true` durante los tests, rompiendo
  aserciones que asumían modo local y abriendo conexiones Realtime reales
  en `AppContexto.test.jsx`. Se añadió `.env.test` con las dos variables de
  Supabase vacías para forzar modo local en `vitest run` sin importar lo
  que haya en `.env.local`.

Ninguno de estos fixes cambia el modelo de datos ni las políticas de
seguridad descritas arriba — solo corrige errores de sintaxis/alcance de
Postgres y de configuración local. `npm run build`/`npm test` verificados
en verde después de cada uno; validados end-to-end contra Supabase local
(login OTP, generar código, rechazo correcto de "no puedes aceptar tu
propio código").

## Limitaciones restantes

1. **Pruebas E2E** (Playwright/Cypress con dos sesiones reales) — no se
   implementaron en esta pasada: este entorno no tiene Docker/Supabase
   corriendo para instalar y validar un E2E en vivo, y dejar un spec sin
   ejecutar nunca sería peor que no dejarlo. El checklist manual equivalente
   sigue disponible en `SUPABASE_TESTING_GUIDE.md`. Estructura sugerida para
   cuando se implemente: dos `browserContext` de Playwright simulando a
   ambos usuarios, lectura del código OTP vía la API de Inbucket local
   (`http://127.0.0.1:54324/api/v1/mailbox/...`, sin abrir su UI), y un
   tercer contexto/usuario para verificar aislamiento por RLS con
   `supabase-js` directo en el test.
2. No hay UI dedicada para "cancelar" una interacción enviada (la acción
   `cancelarInteraccion` ya existe en `AppContexto` y está probada, pero no
   se conectó a un botón visible para no alterar el diseño actual sin que
   el usuario lo pidiera).
3. Revocar/regenerar invitaciones tiene backend completo
   (`revoke_couple_invite`), pero la UI solo ofrece "generar otro código"
   (que crea uno nuevo y revoca los anteriores automáticamente).
4. `period_suggestions` solo soporta sugerir "hoy" desde `SugerenciaRegla.jsx`
   (no un selector de fecha) para mantener el cambio de UI mínimo; el
   backend (`sugerirRegla(coupleId, ownerUserId, fechaISO)`) ya acepta
   cualquier fecha ISO si se quiere ampliar la UI más adelante.

## Siguientes pasos recomendados

1. Implementar las pruebas E2E con Playwright cuando haya un entorno con
   Docker disponible, automatizando `SUPABASE_TESTING_GUIDE.md`.
2. Añadir UI de cancelación de interacciones y de fecha personalizada en
   `SugerenciaRegla.jsx`.
3. Extender `period_records`/`cycle_symptoms` privados si en el futuro se
   quiere backup en la nube del ciclo crudo (hoy es 100% local a propósito).
4. Revisar periódicamente el tamaño de `vendor-supabase` (215 kB) si se
   añaden más módulos de `@supabase/supabase-js`.
