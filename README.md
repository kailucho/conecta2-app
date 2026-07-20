# Conecta2

Una PWA para entenderse mejor y cuidarse en pareja 💙💗.

## Configuración local

```bash
npm install
npm run dev
```

```bash
npm run build     # build de producción
npm run preview   # sirve el build localmente
npm test           # corre la suite de Vitest
npm run test:watch # modo watch
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa lo que necesites:

```env
# Supabase (Fase 2). Si las dejas vacías, la app funciona 100% en modo
# local: sin cuenta, sin vinculación de pareja, sin sincronización.
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# [Legacy] API key de Anthropic usada hoy directo desde el navegador.
# Ver FASE_2_IMPLEMENTATION_SUMMARY.md para la deuda de seguridad asociada.
VITE_ANTHROPIC_API_KEY=
```

## Supabase (backend de Fase 2)

Guía completa en [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md). Resumen de comandos:

```bash
supabase start              # levanta Supabase local (Docker)
supabase db reset           # aplica supabase/migrations/*.sql desde cero
supabase link --project-ref TU_PROJECT_REF
supabase db push            # aplica migraciones a un proyecto remoto
supabase functions deploy ai    # Edge Function de IA (etapa futura)
supabase secrets set NOMBRE=valor
```

Pruebas manuales end-to-end con dos usuarios: [`SUPABASE_TESTING_GUIDE.md`](SUPABASE_TESTING_GUIDE.md).

## Documentación de la Fase 2

- [`FASE_2_SUPABASE_PLAN.md`](FASE_2_SUPABASE_PLAN.md) — diagnóstico y plan de implementación.
- [`FASE_2_IMPLEMENTATION_SUMMARY.md`](FASE_2_IMPLEMENTATION_SUMMARY.md) — qué se implementó, decisiones y limitaciones.

## Estructura del proyecto

```
src/
  pantallas/      # Onboarding, Hoy, Mes, Nosotros, Ajustes, Guía
  componentes/    # UI agrupada por dominio (comunes, hoy, mes, comunicacion, auth, ...)
  contexto/       # AppContexto (estado local) y AuthContexto (sesión Supabase)
  servicios/      # storageService, syncService, authService, coupleService, etc.
  motor/          # lógica pura (fechas, ciclo, gamificación, conexión)
  datos/          # catálogos estáticos
supabase/
  migrations/     # esquema SQL versionado
  config.toml     # configuración de Supabase CLI local
```
