-- ============================================================
-- 0012_fix_search_path_extensions.sql
-- Corrige "function gen_random_bytes(integer) does not exist" (42883).
--
-- Causa: en Supabase, la extensión pgcrypto se instala en el esquema
-- `extensions`, no en `public`. Las funciones RPC fijan
-- `set search_path = public` por seguridad (evita ataques de secuestro de
-- search_path), pero eso también excluye `extensions`, así que
-- gen_random_bytes()/digest() dejan de resolverse dentro de la función.
-- Fix: añadir `extensions` al search_path de las funciones que usan pgcrypto.
-- ============================================================

alter function public.create_couple_invite() set search_path = public, extensions;
alter function public.accept_couple_invite(text) set search_path = public, extensions;
