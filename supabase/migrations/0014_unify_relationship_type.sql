-- ============================================================
-- 0014_unify_relationship_type.sql
-- Unifica la clasificación de tipo de relación a una decisión binaria de
-- convivencia. Antes: 'casados' | 'convivientes' | 'novios'.
-- Ahora:  'conviven' | 'no_conviven'.
--
-- Migra los datos existentes antes de aplicar el nuevo constraint, para no
-- perder ni romper perfiles ya guardados. NULL se preserva (columna sigue
-- siendo nullable). No toca RLS, Auth, Realtime ni grants.
-- ============================================================

-- 1) Quita el constraint anterior (nombre autogenerado por Postgres para el
--    CHECK inline de 0001_profiles.sql).
alter table public.profiles
  drop constraint if exists profiles_relationship_type_check;

-- 2) Normaliza los valores existentes al nuevo esquema binario.
update public.profiles
set relationship_type = 'conviven'
where relationship_type in ('casados', 'convivientes');

update public.profiles
set relationship_type = 'no_conviven'
where relationship_type = 'novios';

-- 3) Restringe la columna a los nuevos valores canónicos (NULL sigue permitido).
alter table public.profiles
  add constraint profiles_relationship_type_check
  check (relationship_type in ('conviven', 'no_conviven'));
