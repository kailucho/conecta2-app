-- ============================================================
-- 0008_point_events.sql
-- Gamificación por eventos: en vez de sincronizar un contador global que
-- ambos dispositivos podrían pisar, cada acción que otorga puntos queda
-- registrada como una fila. El total se deriva sumando filas.
-- ============================================================

create table if not exists public.point_events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  interaction_id uuid references public.interactions(id) on delete set null,
  event_type text not null,
  points int not null,
  -- Clave de deduplicación (equivalente al anti-spam local, p.ej.
  -- "aprecio:2026-07-20" o "deseo:<id>"): un mismo usuario no puede repetir
  -- la misma clave, así ambos dispositivos pueden reintentar sin duplicar.
  dedupe_key text,
  created_at timestamptz not null default now()
);

comment on table public.point_events is
  'Log de eventos que otorgan puntos. El total de cada usuario se calcula '
  'sumando points; nunca se resta ni se sobrescribe un contador global.';

create unique index if not exists idx_point_events_dedupe
  on public.point_events (user_id, dedupe_key)
  where dedupe_key is not null;

create index if not exists idx_point_events_couple on public.point_events (couple_id);

alter table public.point_events enable row level security;

-- Un usuario ve sus propios eventos y los de su pareja activa (para el
-- marcador/celebración compartida). No hay policy de insert: solo la RPC
-- award_points (SECURITY DEFINER) puede escribir.
create policy point_events_select_propio_o_pareja
  on public.point_events for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.couple_members cm
      where cm.couple_id = point_events.couple_id
        and cm.user_id = auth.uid()
        and cm.left_at is null
    )
  );

-- ---------- award_points ----------
-- El valor de puntos por tipo de evento es una lista fija en el servidor:
-- el cliente NUNCA decide cuántos puntos vale una acción.
create or replace function public.award_points(
  p_event_type text,
  p_dedupe_key text default null,
  p_interaction_id uuid default null
)
returns table (awarded boolean, points int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_couple_id uuid;
  v_puntos int;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'no_autenticado';
  end if;

  v_puntos := case p_event_type
    when 'aprecio' then 15
    when 'animo' then 5
    when 'estado' then 5
    when 'accion' then 5
    when 'mensaje' then 5
    when 'deseo' then 50
    when 'cita' then 30
    else null
  end;

  if v_puntos is null then
    raise exception 'evento_no_permitido';
  end if;

  select cm.couple_id into v_couple_id
  from public.couple_members cm
  where cm.user_id = v_uid and cm.left_at is null
  limit 1;

  if v_couple_id is null then
    raise exception 'sin_pareja_vinculada';
  end if;

  insert into public.point_events (couple_id, user_id, interaction_id, event_type, points, dedupe_key)
  values (v_couple_id, v_uid, p_interaction_id, p_event_type, v_puntos, p_dedupe_key)
  on conflict (user_id, dedupe_key) where dedupe_key is not null do nothing
  returning id into v_id;

  if v_id is null then
    return query select false, 0;
  else
    return query select true, v_puntos;
  end if;
end;
$$;

comment on function public.award_points(text, text, uuid) is
  'Otorga puntos de un tipo de evento permitido (lista fija en el servidor) '
  'con deduplicación por dedupe_key. El cliente nunca elige el valor.';

grant execute on function public.award_points(text, text, uuid) to authenticated;
