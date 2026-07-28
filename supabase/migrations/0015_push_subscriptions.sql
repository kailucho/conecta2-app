-- ============================================================
-- 0015_push_subscriptions.sql
-- Suscripciones de Web Push (Nivel 2/3 del resumen matutino). Cada fila es
-- UN endpoint de navegador/dispositivo del usuario dueño. RLS estricta:
-- cada quien administra únicamente sus propias suscripciones.
-- ============================================================

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  creado_el timestamptz not null default now(),
  actualizado_el timestamptz not null default now(),
  unique (endpoint)
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

create trigger push_subscriptions_actualizado_el
  before update on public.push_subscriptions
  for each row execute function public.tocar_actualizado_en();

alter table public.push_subscriptions enable row level security;

create policy push_subscriptions_select_propia
  on public.push_subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create policy push_subscriptions_insert_propia
  on public.push_subscriptions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy push_subscriptions_update_propia
  on public.push_subscriptions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy push_subscriptions_delete_propia
  on public.push_subscriptions for delete
  to authenticated
  using (user_id = auth.uid());

-- El envío server-side (Edge Function con service role) no pasa por RLS; el
-- GRANT aquí es solo para el cliente autenticado que registra/revoca su propia
-- suscripción.
grant select, insert, update, delete on public.push_subscriptions to authenticated;
