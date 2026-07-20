-- ============================================================
-- 0003_interactions.sql
-- Interacciones entre miembros de una pareja (quick actions, mensajes,
-- ánimo, aprecios, alertas). `status` es el estado FUNCIONAL del dominio;
-- el estado de sincronización (pending/syncing/synced/failed) vive solo en
-- la caché local del cliente y nunca en esta tabla.
-- ============================================================

create table if not exists public.interactions (
  id uuid primary key,
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  receiver_id uuid not null references auth.users(id),
  type text not null,
  action_id text,
  category text,
  note text,
  valence text,
  status text not null default 'active' check (status in ('active', 'acknowledged', 'cancelled', 'expired')),
  response_text text,
  client_created_at timestamptz,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint interactions_sender_receiver_distintos check (sender_id <> receiver_id)
);

comment on table public.interactions is
  'Interacciones enviadas entre los dos miembros de una pareja. El id lo '
  'genera el cliente (UUID) para permitir upsert idempotente desde la cola offline.';

create index if not exists idx_interactions_couple on public.interactions (couple_id, created_at desc);
create index if not exists idx_interactions_receiver on public.interactions (receiver_id, status);

drop trigger if exists interactions_actualizado_en on public.interactions;
create trigger interactions_actualizado_en
  before update on public.interactions
  for each row execute function public.tocar_actualizado_en();
