# Bitácora del Día

Agenda y lista de tareas diaria: tareas con hora y categoría, progreso del día, vista semanal, pasar pendientes a mañana y notas por día.

- `index.html`: la app. Lee y guarda cada día con `/api/day`.
- `login.html`: pide usuario (o correo) y contraseña. Los usuarios se crean en Supabase → Authentication → Users → Add user; un usuario sin "@" se escribe en Supabase como `usuario@bitacora.app`.
- `middleware.js`: sin sesión válida, todas las páginas mandan a `/login.html`.
- `api/`: funciones de Vercel que hablan con Supabase usando la llave secreta del servidor.
- `supabase.sql`: la tabla `bitacora_notes` (un día por fila, por correo del usuario). Se pega una vez en Supabase → SQL Editor → Run.

## Configuración en Vercel

Conecta un proyecto de Supabase en **Storage**. Vercel agrega `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (o `SUPABASE_SECRET_KEY`). Opcional: `SESSION_SECRET` para firmar las sesiones con otra llave.

Las contraseñas las guarda Supabase Auth, nunca este repo. Para cambiar una contraseña, borra el usuario en Supabase y créalo otra vez con el mismo correo: las tareas se quedan. Cada `git push` a `main` vuelve a desplegar el sitio.

## Atajos

- `n`: escribir una tarea nueva
- `←` / `→`: día anterior / siguiente
