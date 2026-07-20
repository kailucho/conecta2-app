-- ============================================================
-- 0010_grants.sql
-- Concede los privilegios base de tabla (GRANT) necesarios para que el rol
-- `authenticated` pueda ejecutar las consultas directas del cliente. RLS
-- (ya definida en 0005/0007/0008) sigue siendo la que decide QUÉ filas ve
-- cada usuario; sin este GRANT, Postgres rechaza la consulta antes incluso
-- de evaluar las políticas ("permission denied for table ...").
--
-- Las tablas couples/couple_members se escriben EXCLUSIVAMENTE vía RPC
-- (SECURITY DEFINER, corren como dueño de la función y no necesitan estos
-- grants), por eso aquí solo reciben SELECT.
-- ============================================================

grant usage on schema public to authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select on public.couples to authenticated;
grant select on public.couple_members to authenticated;
grant select on public.couple_invites to authenticated;
grant select, insert, update on public.interactions to authenticated;
grant select, insert, update on public.cycle_shared_snapshots to authenticated;
grant select, insert on public.period_suggestions to authenticated;
grant select on public.point_events to authenticated;
