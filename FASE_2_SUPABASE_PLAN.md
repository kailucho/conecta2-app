# Fase 2 — Plan de integración Supabase (Conecta2)

## Diagnóstico del estado actual

- React 18 + Vite + Tailwind, sin router (tabs vía `useState` en `src/App.jsx`).
- Estado global: Context + `useReducer` en `src/contexto/AppContexto.jsx`.
- Persistencia 100% local: `src/servicios/storageService.js` (prefijo `mp:` en `localStorage`).
- `src/servicios/syncService.js` es un stub declarado para Fase 2 (`vinculacionDisponible()` → `false`, `drenarCola()` no-op, `colaSalida` nunca se drena).
- `src/servicios/aiService.js` llama a Anthropic directo desde el navegador con `VITE_ANTHROPIC_API_KEY` (fuga de clave), con fallbacks estáticos robustos — fuera de alcance del núcleo, documentado como deuda.
- Identidad: `userId` generado localmente vía `generarId()` (UUID) en el onboarding.
- Roles ya usan `'el'` / `'ella'`, coincide con `app_role` del modelo objetivo.
- Único embudo de acciones hacia la pareja: `enviarInteraccionPareja` (AppContexto) → si no vinculada, dispara `ParejaRequerida.jsx` (modal guard). Punto de integración ideal.
- `InvitarPareja.jsx` es solo texto estático hoy ("próximamente"); `generarCodigoInvitacion` existe pero no está conectado.
- `BandejaPareja.jsx` ya filtra por `receiverId`/`senderId`/`status` — listo para recibir datos remotos.
- Interacciones no tienen estado `cancelled` ni función de cancelar — se añade en Fase 2.

## Archivos que se modifican

- `src/main.jsx`, `src/contexto/AppContexto.jsx`, `src/servicios/storageService.js`,
  `src/servicios/syncService.js`, `src/App.jsx`, `src/componentes/ajustes/InvitarPareja.jsx`.

## Archivos que se crean

- `src/servicios/supabaseClient.js`, `authService.js`, `profileService.js`, `coupleService.js`,
  `interactionRepository.js`, `colaOffline.js`, `migracionLocal.js`.
- `src/contexto/AuthContexto.jsx`.
- `src/componentes/auth/PantallaAcceso.jsx`, `src/componentes/comunes/IndicadorSync.jsx`.
- `supabase/config.toml`, `supabase/migrations/0001..0006_*.sql`.
- Pruebas `*.test.js` junto a cada servicio nuevo.
- `SUPABASE_SETUP.md`, `SUPABASE_TESTING_GUIDE.md`, `FASE_2_IMPLEMENTATION_SUMMARY.md`.

## Modelo de datos

Ver detalle completo en las migraciones SQL (`supabase/migrations/`). Resumen:
`profiles`, `couples`, `couple_members`, `couple_invites` (código guardado como hash),
`interactions` (status funcional `active|acknowledged|cancelled|expired`, sin `pending_sync`).

## Flujo de autenticación

Email → OTP de 6 dígitos (Supabase Auth, sin contraseña) → sesión persistente
(`supabase.auth.onAuthStateChange` + `getSession`) → carga/crea perfil en `profiles`.
Se pide solo al vincular pareja o activar sincronización, no en el onboarding inicial.

## Flujo de vinculación

`create_couple_invite()` (RPC) genera código, se muestra en claro solo al creador y se
guarda `code_hash` en BD. `accept_couple_invite(code)` (RPC) valida vigencia/uso/miembros
y añade al segundo miembro atómicamente. El frontend nunca inserta en `couple_members`.

## Estrategia offline

Cola de operaciones enriquecida (`operationId, entity, action, entityId, payload, attempts,
lastError, createdAt, updatedAt`) persistida vía `storageService`, drenada en los eventos
descritos en el plan aprobado, con `upsert` por `id` para evitar duplicados.

## Estrategia de migración

`storage_schema_version` + `legacy_local_user_id`; migración idempotente de perfil e
interacciones propias tras autenticar, sin borrar `localStorage` hasta confirmar sync.

## Políticas RLS

RLS activada en todas las tablas expuestas; ver comentarios en
`supabase/migrations/0005_rls.sql`. Resumen: acceso restringido a filas propias o de la
pareja activa; inserciones de miembros de pareja solo vía RPC `SECURITY DEFINER`.

## Riesgos detectados

1. Modo local debe seguir funcionando sin variables de Supabase configuradas.
2. Duplicados por combinación Realtime + cola offline → mitigado con `upsert` por `id`.
3. RLS mal escrita puede bloquear lecturas legítimas → validar con `supabase db reset` y dos usuarios.
4. Doble migración de datos locales → mitigado con `storage_schema_version`.
5. `VITE_ANTHROPIC_API_KEY` sigue expuesta (deuda documentada, Edge Function fuera del núcleo).

## Orden de implementación

Etapa 1 (Auth) → Etapa 2 (Parejas/RLS) → Etapa 3 (Interacciones) → Etapa 4 (Offline/Migración)
→ Etapa 5 (Realtime/Indicador). Build y tests verdes después de cada etapa.
