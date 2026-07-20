-- ============================================================
-- 0009_fix_couple_members_rls.sql
-- Corrige "infinite recursion detected in policy for relation
-- couple_members": la política de SELECT original hacía una subconsulta
-- sobre la propia tabla couple_members, y Postgres reevaluaba esa misma
-- política para resolver la subconsulta, recursivamente.
--
-- Fix estándar de Supabase: un helper SECURITY DEFINER consulta la tabla
-- con los privilegios de su dueño (bypassa RLS), así la política ya no se
-- referencia a sí misma.
-- ============================================================

create or replace function public.es_miembro_activo(p_couple_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.couple_members
    where couple_id = p_couple_id
      and user_id = auth.uid()
      and left_at is null
  );
$$;

comment on function public.es_miembro_activo(uuid) is
  'Helper SECURITY DEFINER para evitar recursión de RLS al consultar '
  'couple_members desde su propia política de SELECT.';

grant execute on function public.es_miembro_activo(uuid) to authenticated;

drop policy if exists couple_members_select_de_mi_pareja on public.couple_members;

create policy couple_members_select_de_mi_pareja
  on public.couple_members for select
  to authenticated
  using (public.es_miembro_activo(couple_id));
