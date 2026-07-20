-- ============================================================
-- 0005_rls.sql
-- Row Level Security estricta en todas las tablas expuestas. Ningún acceso
-- se basa únicamente en validaciones del frontend.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.interactions enable row level security;

-- ---------- profiles ----------
-- Un usuario lee su propio perfil y el de su pareja activa (datos mínimos:
-- toda la fila de profiles es "mínima" por diseño, no incluye datos de ciclo).
create policy profiles_select_propio_o_pareja
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.couple_members mio
      join public.couple_members pareja
        on pareja.couple_id = mio.couple_id
       and pareja.user_id = profiles.id
       and pareja.left_at is null
      where mio.user_id = auth.uid()
        and mio.left_at is null
    )
  );

create policy profiles_insert_propio
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update_propio
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------- couples ----------
-- Solo miembros activos consultan su pareja. Sin insert/update/delete para
-- el rol authenticated: toda escritura pasa por las funciones RPC.
create policy couples_select_miembros_activos
  on public.couples for select
  to authenticated
  using (
    exists (
      select 1 from public.couple_members cm
      where cm.couple_id = couples.id
        and cm.user_id = auth.uid()
        and cm.left_at is null
    )
  );

-- ---------- couple_members ----------
-- Un usuario ve las filas de su propia pareja activa (la suya y la del otro
-- miembro). No hay policies de insert/update/delete: solo las RPC (SECURITY
-- DEFINER) pueden escribir esta tabla.
create policy couple_members_select_de_mi_pareja
  on public.couple_members for select
  to authenticated
  using (
    exists (
      select 1 from public.couple_members mio
      where mio.couple_id = couple_members.couple_id
        and mio.user_id = auth.uid()
        and mio.left_at is null
    )
  );

-- ---------- couple_invites ----------
-- Solo el creador puede consultar/gestionar sus invitaciones. La aceptación
-- ocurre exclusivamente vía accept_couple_invite (RPC), nunca por select/update directo.
create policy couple_invites_select_propio
  on public.couple_invites for select
  to authenticated
  using (created_by = auth.uid());

-- ---------- interactions ----------
-- Lectura: el usuario debe ser emisor o receptor Y miembro activo de la pareja.
create policy interactions_select_participante
  on public.interactions for select
  to authenticated
  using (
    (auth.uid() = sender_id or auth.uid() = receiver_id)
    and exists (
      select 1 from public.couple_members cm
      where cm.couple_id = interactions.couple_id
        and cm.user_id = auth.uid()
        and cm.left_at is null
    )
  );

-- Creación: solo el emisor, y debe ser miembro activo de la pareja indicada,
-- con el receptor siendo el otro miembro activo de esa misma pareja.
create policy interactions_insert_emisor
  on public.interactions for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.couple_members cm
      where cm.couple_id = interactions.couple_id
        and cm.user_id = auth.uid()
        and cm.left_at is null
    )
    and exists (
      select 1 from public.couple_members cm2
      where cm2.couple_id = interactions.couple_id
        and cm2.user_id = interactions.receiver_id
        and cm2.left_at is null
    )
  );

-- Actualización: el emisor solo puede cancelar la suya; el receptor solo
-- puede reconocerla o responderla. Se valida con USING (fila visible) +
-- WITH CHECK (quién puede terminar escribiendo qué).
create policy interactions_update_emisor_cancela
  on public.interactions for update
  to authenticated
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id and status in ('active', 'cancelled'));

create policy interactions_update_receptor_responde
  on public.interactions for update
  to authenticated
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id and status in ('active', 'acknowledged'));
