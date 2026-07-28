-- ============================================================
-- 0017_notification_deliveries.sql
-- Registro de entregas del resumen matutino por push (Nivel 3), para
-- IDEMPOTENCIA: la Edge Function nunca reenvía el resumen del mismo día al
-- mismo usuario. No guarda el contenido del mensaje, solo la marca de envío.
--
-- Esta tabla solo la escribe la Edge Function con la service role key (no
-- pasa por RLS de cliente); el cliente autenticado únicamente puede leer sus
-- propias entregas (por transparencia, no es necesario para el flujo).
-- ============================================================

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null, -- fecha local del usuario a la que corresponde el resumen
  enviado_el timestamptz not null default now(),
  unique (user_id, fecha)
);

create index notification_deliveries_user_id_idx on public.notification_deliveries (user_id);

alter table public.notification_deliveries enable row level security;

create policy notification_deliveries_select_propia
  on public.notification_deliveries for select
  to authenticated
  using (user_id = auth.uid());

grant select on public.notification_deliveries to authenticated;
