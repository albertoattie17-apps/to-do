# Bitácora del Día

Agenda y lista de tareas diaria: tareas con hora y categoría, progreso del día, vista semanal, pasar pendientes a mañana y notas por día.

Es un sitio estático (un solo `index.html`, sin build). Los datos se guardan en el navegador (`localStorage`), así que cada dispositivo tiene su propia lista.

## Desplegar en Vercel

1. Sube este repo a GitHub.
2. En [vercel.com/new](https://vercel.com/new) importa el repo.
3. Framework Preset: **Other**. Sin comando de build. Deploy.

Cada `git push` a `main` vuelve a desplegar el sitio.

## Atajos

- `n`: escribir una tarea nueva
- `←` / `→`: día anterior / siguiente
