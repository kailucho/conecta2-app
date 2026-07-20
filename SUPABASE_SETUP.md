# Configuración de Supabase para Conecta2

Guía paso a paso para dejar el backend de Fase 2 funcionando, tanto en local
(Supabase CLI + Docker) como en un proyecto real de supabase.com.

## 1. Crear el proyecto Supabase

**Local (recomendado para desarrollo):**
```bash
npm install -g supabase   # o usa npx supabase en cada comando
supabase init             # ya existe supabase/config.toml en este repo, puedes omitirlo
supabase start            # requiere Docker corriendo
```
Al terminar, `supabase start` imprime `API URL`, `anon key` y `service_role key`
locales. Usa **API URL** y **anon key** en tu `.env.local` (nunca la `service_role`).

**Proyecto en la nube:** crea uno en https://supabase.com/dashboard, y toma
`Project URL` y `anon/public key` desde *Settings → API*.

## 2. Configurar Auth (correo + OTP, sin contraseña)

En el dashboard (o `supabase/config.toml` para local, ya incluido):
- *Authentication → Providers → Email*: activa "Email OTP" / desactiva la
  confirmación por link si prefieres solo código de 6 dígitos.
- *Authentication → URL Configuration*: agrega `http://localhost:5173` como
  Site URL / Redirect URL (solo se usa para metadatos; el flujo OTP de esta
  app no depende de redirect links).

## 3. Aplicar las migraciones

```bash
supabase db reset        # local: recrea la base y aplica supabase/migrations/*.sql
# o, contra un proyecto remoto ya vinculado:
supabase link --project-ref TU_PROJECT_REF
supabase db push
```
Las migraciones están numeradas en `supabase/migrations/`:
`0001_profiles`, `0002_couples_invites`, `0003_interactions`, `0004_rpc`,
`0005_rls`, `0006_realtime`, `0007_cycle_sharing`, `0008_point_events`,
`0009_fix_couple_members_rls`, `0010_grants`,
`0011_fix_ambiguous_couple_id`, `0012_fix_search_path_extensions`,
`0013_fix_ambiguous_on_conflict` (0009-0013 corrigen bugs encontrados al
probar contra Supabase local real, ver `FASE_2_IMPLEMENTATION_SUMMARY.md`
sección "Fase 2c").

## 4. Habilitar Realtime

`0006_realtime.sql` ya agrega `interactions` a la publicación
`supabase_realtime`. Si usas un proyecto remoto y `db push` no la aplicó,
verifica en *Database → Replication* que la tabla `interactions` esté marcada.

## 5. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa:
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321        # o la URL de tu proyecto
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>
```
Si dejas estas variables vacías, la app sigue funcionando en modo 100% local
(sin cuenta, sin vinculación, sin sincronización) — no debe quedar en blanco.

## 6. Configurar secretos de IA

La Edge Function `supabase/functions/ai/index.ts` reemplaza la llamada
directa a Anthropic que hacía el navegador. La API key vive SOLO como
secreto del servidor, nunca en el bundle del frontend:

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

Localmente, en vez de `secrets set`, puedes crear `supabase/.env` (ignorado
por git) con `ANTHROPIC_API_KEY=sk-ant-...` y pasarlo con
`supabase functions serve ai --env-file supabase/.env` para probar antes de
desplegar. Si no configuras la key (ni local ni remoto), `askAI()` sigue
funcionando con los fallbacks estáticos — no rompe nada.

## 7. Desplegar (proyecto remoto)

```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
supabase functions deploy ai
```

## 8. Probar con dos cuentas

Ver `SUPABASE_TESTING_GUIDE.md` para el flujo completo con dos navegadores.

## Comandos de referencia

```bash
supabase start            # levanta Supabase local (Docker)
supabase stop              # lo detiene
supabase db reset          # recrea la base local y reaplica migraciones
supabase db push           # aplica migraciones a un proyecto remoto vinculado
supabase functions deploy ai   # despliega la Edge Function de IA (futuro)
supabase secrets set NOMBRE=valor   # configura un secreto de servidor
```
