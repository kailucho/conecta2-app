-- ============================================================
-- 0016_notification_preferences.sql
-- Preferencias del resumen matutino replicadas en servidor (necesarias para
-- que la Edge Function programada del Nivel 3 decida a quién notificar sin
-- depender de localStorage). El cliente sigue siendo la fuente de verdad de
-- uso diario (config.resumenMatutino); esta tabla es su espejo mínimo.
-- No guarda contenido sensible: solo horario/días/flags, nunca datos del ciclo.
-- ============================================================

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  activo boolean not null default false,
  hora time not null default '07:00',
  dias smallint[] not null default '{0,1,2,3,4,5,6}', -- 0=domingo … 6=sábado
  zona_horaria text not null default 'America/Lima',
  fines_semana boolean not null default true,
  contenido_sensible boolean not null default false,
  silencio boolean not null default false,
  actualizado_el timestamptz not null default now()
);

create trigger notification_preferences_actualizado_el
  before update on public.notification_preferences
  for each row execute function public.tocar_actualizado_en();

alter table public.notification_preferences enable row level security;

create policy notification_preferences_select_propia
  on public.notification_preferences for select
  to authenticated
  using (user_id = auth.uid());

create policy notification_preferences_upsert_propia
  on public.notification_preferences for insert
  to authenticated
  with check (user_id = auth.uid());

create policy notification_preferences_update_propia
  on public.notification_preferences for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.notification_preferences to authenticated;
