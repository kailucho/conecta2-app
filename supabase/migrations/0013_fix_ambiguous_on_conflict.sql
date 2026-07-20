-- ============================================================
-- 0013_fix_ambiguous_on_conflict.sql
-- Corrige "column reference couple_id is ambiguous" dentro de
-- accept_couple_invite(), esta vez en la lista de columnas del
-- ON CONFLICT (couple_id, user_id). Igual que en 0011, el nombre
-- `couple_id` choca con el parámetro de salida `RETURNS TABLE(couple_id
-- uuid)` de esta función — pero a diferencia de una cláusula WHERE, aquí no
-- se puede "alias" una lista de columnas de ON CONFLICT. El fix es usar el
-- nombre de la restricción (`ON CONFLICT ON CONSTRAINT ...`) en vez de la
-- lista de columnas, lo que evita por completo la referencia ambigua.
-- ============================================================

create or replace function public.accept_couple_invite(p_code text)
returns table (couple_id uuid)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_uid uuid := auth.uid();
  v_hash text;
  v_invite record;
  v_miembros_activos int;
  v_otra_pareja boolean;
begin
  if v_uid is null then
    raise exception 'no_autenticado';
  end if;

  v_hash := encode(digest(upper(trim(coalesce(p_code, ''))), 'sha256'), 'hex');

  select * into v_invite
  from public.couple_invites
  where code_hash = v_hash
  order by created_at desc
  limit 1
  for update;

  if v_invite is null then
    raise exception 'codigo_invalido';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'codigo_revocado';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'codigo_ya_usado';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'codigo_expirado';
  end if;
  if v_invite.created_by = v_uid then
    raise exception 'no_puedes_aceptar_tu_propio_codigo';
  end if;

  select count(*) into v_miembros_activos
  from public.couple_members cm
  where cm.couple_id = v_invite.couple_id and cm.left_at is null;

  if v_miembros_activos >= 2 then
    raise exception 'pareja_completa';
  end if;

  select exists(
    select 1 from public.couple_members cm
    where cm.user_id = v_uid and cm.left_at is null and cm.couple_id <> v_invite.couple_id
  ) into v_otra_pareja;

  if v_otra_pareja then
    raise exception 'usuario_ya_vinculado';
  end if;

  insert into public.couple_members (couple_id, user_id)
  values (v_invite.couple_id, v_uid)
  on conflict on constraint couple_members_pkey do update set left_at = null, joined_at = now();

  update public.couple_invites
  set accepted_by = v_uid, accepted_at = now()
  where id = v_invite.id;

  update public.couples
  set status = 'activa'
  where id = v_invite.couple_id;

  return query select v_invite.couple_id;
end;
$$;

comment on function public.accept_couple_invite(text) is
  'Valida un código de invitación y vincula al usuario actual como segundo miembro.';
