-- ============================================================
-- 0002_couples_invites.sql
-- Parejas, membresías e invitaciones. El código de invitación se guarda
-- SOLO como hash (code_hash); el código en claro nunca se persiste, solo se
-- devuelve una vez al creador vía RPC.
-- ============================================================

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  status text not null default 'pendiente' check (status in ('pendiente', 'activa', 'disuelta')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.couples is 'Una pareja; queda "activa" cuando tiene 2 miembros vigentes.';

drop trigger if exists couples_actualizado_en on public.couples;
create trigger couples_actualizado_en
  before update on public.couples
  for each row execute function public.tocar_actualizado_en();

create table if not exists public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (couple_id, user_id)
);

comment on table public.couple_members is
  'Miembros de una pareja. Se inserta EXCLUSIVAMENTE vía las funciones RPC '
  '(create_couple_invite / accept_couple_invite), nunca por insert directo del frontend.';

-- Un usuario solo puede tener una pareja activa a la vez (left_at es null).
create unique index if not exists idx_couple_members_activo_unico
  on public.couple_members (user_id)
  where left_at is null;

create table if not exists public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  code_hash text not null,
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.couple_invites is
  'Invitaciones de vinculación. code_hash es sha-256 del código de 6-8 '
  'caracteres mostrado al creador; el código en claro nunca se guarda.';

create index if not exists idx_couple_invites_couple on public.couple_invites (couple_id);
create index if not exists idx_couple_invites_code_hash on public.couple_invites (code_hash);
