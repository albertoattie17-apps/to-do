-- Tabla de Bitácora del Día. Pegar en Supabase → SQL Editor → Run.
-- Los usuarios viven en Supabase Auth (Authentication → Users); cada día se guarda por el correo del usuario.
-- Solo el servidor (con la llave secreta) lee y escribe; RLS sin políticas bloquea todo acceso público.

create table if not exists bitacora_notes (
  owner text not null,
  day date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner, day)
);

alter table bitacora_notes enable row level security;
