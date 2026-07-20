-- ============================================================
-- 0007_cycle_sharing.sql
-- Resumen compartido del ciclo (nunca los datos crudos). El motor de ciclo
-- sigue siendo 100% local (src/motor/motorCiclo.js); aquí solo se guarda un
-- snapshot ya filtrado según profiles.hormonal_privacy ('todo' | 'solo_fases'
-- | 'solo_alertas'), calculado y filtrado en el cliente antes de subir —
-- estas tablas NUNCA contienen menstruaciones completas, síntomas ni notas.
-- ============================================================

create table if not exists public.cycle_shared_snapshots (
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  visible_phase text,       -- null si hormonal_privacy = 'solo_alertas'
  cycle_day int,            -- null salvo hormonal_privacy = 'todo'
  general_alert boolean not null default false, -- "zona roja" sin detalle
  privacy_level text not null check (privacy_level in ('todo', 'solo_fases', 'solo_alertas')),
  updated_at timestamptz not null default now(),
  primary key (owner_user_id, couple_id)
);

comment on table public.cycle_shared_snapshots is
  'Resumen mínimo y ya filtrado del ciclo de la propietaria, visible para su '
  'pareja. Los registros crudos (period_records, cycle_symptoms) no existen '
  'en el servidor: el ciclo real sigue siendo 100% local en el dispositivo.';

drop trigger if exists cycle_shared_snapshots_actualizado_en on public.cycle_shared_snapshots;
create trigger cycle_shared_snapshots_actualizado_en
  before update on public.cycle_shared_snapshots
  for each row execute function public.tocar_actualizado_en();

alter table public.cycle_shared_snapshots enable row level security;

-- La propietaria lee y escribe (upsert) su propia fila; la pareja activa
-- solo puede leerla, nunca modificarla.
create policy cycle_snapshots_select_propio_o_pareja
  on public.cycle_shared_snapshots for select
  to authenticated
  using (
    owner_user_id = auth.uid()
    or exists (
      select 1 from public.couple_members cm
      where cm.couple_id = cycle_shared_snapshots.couple_id
        and cm.user_id = auth.uid()
        and cm.left_at is null
    )
  );

create policy cycle_snapshots_upsert_propio
  on public.cycle_shared_snapshots for insert
  to authenticated
  with check (
    owner_user_id = auth.uid()
    and exists (
      select 1 from public.couple_members cm
      where cm.couple_id = cycle_shared_snapshots.couple_id
        and cm.user_id = auth.uid()
        and cm.left_at is null
    )
  );

create policy cycle_snapshots_update_propio
  on public.cycle_shared_snapshots for update
  to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- ---------- period_suggestions ----------
create table if not exists public.period_suggestions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  suggested_by uuid not null references auth.users(id),
  owner_user_id uuid not null references auth.users(id),
  suggested_start_date date not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint period_suggestions_no_autosugerencia check (suggested_by <> owner_user_id)
);

comment on table public.period_suggestions is
  'Sugerencia de una posible fecha de inicio de regla hecha por la pareja. '
  'Solo la propietaria puede aceptarla/rechazarla (respond_period_suggestion); '
  'aceptar NUNCA escribe en datos privados del servidor — eso lo hace el '
  'cliente localmente al recibir la confirmación.';

alter table public.period_suggestions enable row level security;

create policy period_suggestions_select_participante
  on public.period_suggestions for select
  to authenticated
  using (suggested_by = auth.uid() or owner_user_id = auth.uid());

create policy period_suggestions_insert_pareja_activa
  on public.period_suggestions for insert
  to authenticated
  with check (
    suggested_by = auth.uid()
    and exists (
      select 1 from public.couple_members cm
      where cm.couple_id = period_suggestions.couple_id
        and cm.user_id = auth.uid() and cm.left_at is null
    )
    and exists (
      select 1 from public.couple_members cm2
      where cm2.couple_id = period_suggestions.couple_id
        and cm2.user_id = period_suggestions.owner_user_id and cm2.left_at is null
    )
  );

-- Sin policy de update: solo la RPC respond_period_suggestion (SECURITY
-- DEFINER) puede cambiar el status.

create or replace function public.respond_period_suggestion(p_id uuid, p_aceptar boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_status text;
begin
  if v_uid is null then
    raise exception 'no_autenticado';
  end if;

  select owner_user_id, status into v_owner, v_status
  from public.period_suggestions
  where id = p_id
  for update;

  if v_owner is null then
    raise exception 'sugerencia_no_encontrada';
  end if;
  if v_owner <> v_uid then
    raise exception 'no_autorizado';
  end if;
  if v_status <> 'pending' then
    raise exception 'sugerencia_ya_respondida';
  end if;

  update public.period_suggestions
  set status = case when p_aceptar then 'accepted' else 'rejected' end,
      reviewed_at = now()
  where id = p_id;
end;
$$;

comment on function public.respond_period_suggestion(uuid, boolean) is
  'Solo la propietaria puede aceptar/rechazar una sugerencia de fecha de '
  'regla. No escribe ningún dato privado: el cliente que recibe la '
  'confirmación es quien actualiza su ciclo local si acepta.';

grant execute on function public.respond_period_suggestion(uuid, boolean) to authenticated;
