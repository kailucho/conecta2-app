-- ============================================================
-- 0001_profiles.sql
-- Perfil de usuario, 1:1 con auth.users. app_role usa los mismos valores
-- que el frontend ('el' | 'ella') para no requerir mapeo adicional.
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  app_role text check (app_role in ('el', 'ella')),
  relationship_type text check (relationship_type in ('casados', 'convivientes', 'novios')),
  humor_tone text check (humor_tone in ('suave', 'normal', 'sinfiltro')),
  hormonal_privacy text check (hormonal_privacy in ('todo', 'solo_fases', 'solo_alertas')),
  legacy_local_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de cada usuario autenticado. legacy_local_user_id conserva el UUID '
  'generado localmente antes de tener cuenta, para poder migrar sus datos.';

-- Mantiene updated_at al día en cada UPDATE.
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_actualizado_en on public.profiles;
create trigger profiles_actualizado_en
  before update on public.profiles
  for each row execute function public.tocar_actualizado_en();
