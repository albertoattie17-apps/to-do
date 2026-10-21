-- Tablas de Bitácora del Día. Pegar en Supabase → SQL Editor → Run.
-- Solo el servidor (con la llave secreta) lee y escribe; RLS sin políticas bloquea todo acceso público.

create table if not exists bitacora_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  pass_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists bitacora_days (
  user_id uuid not null references bitacora_users(id) on delete cascade,
  day date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table bitacora_users enable row level security;
alter table bitacora_days enable row level security;
