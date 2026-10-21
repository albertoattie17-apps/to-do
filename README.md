# Bitácora del Día

Agenda y lista de tareas diaria: tareas con hora y categoría, progreso del día, vista semanal, pasar pendientes a mañana y notas por día.

- `index.html`: la app. Lee y guarda cada día con `/api/day`.
- `login.html`: la primera vez crea la cuenta (solo se permite una); después pide usuario y contraseña (mínimo 4 caracteres).
- `middleware.js`: sin sesión válida, todas las páginas mandan a `/login.html`.
- `api/`: funciones de Vercel que hablan con Supabase usando la llave secreta del servidor.
- `supabase.sql`: las tablas. Se pegan una vez en Supabase → SQL Editor → Run.

## Configuración en Vercel

Conecta un proyecto de Supabase en **Storage**. Vercel agrega `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (o `SUPABASE_SECRET_KEY`). Opcional: `SESSION_SECRET` para firmar las sesiones con otra llave.

Las contraseñas se guardan cifradas (scrypt) en Supabase, nunca en este repo. Cada `git push` a `main` vuelve a desplegar el sitio.

## Atajos

- `n`: escribir una tarea nueva
- `←` / `→`: día anterior / siguiente
