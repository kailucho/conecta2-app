-- ============================================================
-- 0006_realtime.sql
-- Habilita Postgres Changes (Realtime) sobre interactions. RLS ya restringe
-- qué filas puede ver cada usuario, así que los eventos Realtime respetan
-- la misma seguridad que las lecturas normales.
-- ============================================================

alter publication supabase_realtime add table public.interactions;
