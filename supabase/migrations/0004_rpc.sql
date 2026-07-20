-- ============================================================
-- 0004_rpc.sql
-- Funciones RPC transaccionales para vinculación de pareja. El frontend
-- SOLO puede vincularse a través de estas funciones (SECURITY DEFINER),
-- nunca insertando directamente en couple_members.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- create_couple_invite ----------
-- Crea (o reutiliza) la pareja "pendiente" del usuario y genera un código de
-- invitación de un solo uso. Devuelve el código EN CLARO solo aquí; en la
-- tabla se guarda únicamente su hash.
create or replace function public.create_couple_invite()
returns table (code text, couple_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_couple_id uuid;
  v_code text;
  v_expires timestamptz := now() + interval '24 hours';
begin
  if v_uid is null then
    raise exception 'no_autenticado';
  end if;

  -- Si el usuario ya tiene una pareja activa (con 2 miembros), no puede crear otra.
  select cm.couple_id into v_couple_id
  from public.couple_members cm
  where cm.user_id = v_uid and cm.left_at is null;

  if v_couple_id is not null then
    if (select count(*) from public.couple_members cm2
        where cm2.couple_id = v_couple_id and cm2.left_at is null) >= 2 then
      raise exception 'usuario_ya_vinculado';
    end if;
  else
    insert into public.couples (created_by, status)
    values (v_uid, 'pendiente')
    returning id into v_couple_id;

    insert into public.couple_members (couple_id, user_id)
    values (v_couple_id, v_uid);
  end if;

  -- Revoca invitaciones previas sin usar de esta pareja (evita códigos duplicados vigentes).
  update public.couple_invites
  set revoked_at = now()
  where couple_id = v_couple_id and accepted_at is null and revoked_at is null;

  -- Código de 6 caracteres alfanuméricos en mayúsculas, fácil de dictar/copiar.
  v_code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 6));

  insert into public.couple_invites (couple_id, code_hash, created_by, expires_at)
  values (v_couple_id, encode(digest(v_code, 'sha256'), 'hex'), v_uid, v_expires);

  return query select v_code, v_couple_id, v_expires;
end;
$$;

comment on function public.create_couple_invite() is
  'Crea una invitación de pareja y devuelve el código en claro una única vez.';

-- ---------- accept_couple_invite ----------
-- Valida el código y añade al usuario actual como segundo miembro de la pareja.
create or replace function public.accept_couple_invite(p_code text)
returns table (couple_id uuid)
language plpgsql
security definer
set search_path = public
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
  from public.couple_members
  where couple_id = v_invite.couple_id and left_at is null;

  if v_miembros_activos >= 2 then
    raise exception 'pareja_completa';
  end if;

  select exists(
    select 1 from public.couple_members
    where user_id = v_uid and left_at is null and couple_id <> v_invite.couple_id
  ) into v_otra_pareja;

  if v_otra_pareja then
    raise exception 'usuario_ya_vinculado';
  end if;

  insert into public.couple_members (couple_id, user_id)
  values (v_invite.couple_id, v_uid)
  on conflict (couple_id, user_id) do update set left_at = null, joined_at = now();

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

-- ---------- leave_couple ----------
-- Desvincula al usuario actual y disuelve la pareja (ambos miembros quedan
-- sin pareja activa; las interacciones históricas se conservan).
create or replace function public.leave_couple()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_couple_id uuid;
begin
  if v_uid is null then
    raise exception 'no_autenticado';
  end if;

  select couple_id into v_couple_id
  from public.couple_members
  where user_id = v_uid and left_at is null
  limit 1;

  if v_couple_id is null then
    return;
  end if;

  update public.couple_members
  set left_at = now()
  where couple_id = v_couple_id and left_at is null;

  update public.couples
  set status = 'disuelta'
  where id = v_couple_id;
end;
$$;

comment on function public.leave_couple() is
  'Desvincula al usuario actual de su pareja activa (ambos miembros quedan sin pareja).';

-- ---------- revoke_couple_invite ----------
-- Solo el creador puede revocar su propia invitación pendiente.
create or replace function public.revoke_couple_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'no_autenticado';
  end if;

  update public.couple_invites
  set revoked_at = now()
  where id = p_invite_id
    and created_by = v_uid
    and accepted_at is null
    and revoked_at is null;
end;
$$;

comment on function public.revoke_couple_invite(uuid) is
  'Permite al creador revocar una invitación de pareja aún no aceptada.';

grant execute on function public.create_couple_invite() to authenticated;
grant execute on function public.accept_couple_invite(text) to authenticated;
grant execute on function public.leave_couple() to authenticated;
grant execute on function public.revoke_couple_invite(uuid) to authenticated;
