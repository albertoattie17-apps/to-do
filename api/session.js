// Dice a la pantalla de login si Supabase está listo y si ya hay sesión.
import { config, sb, sessionUser, json } from "./_lib.js";

export default async function handler(req, res) {
  if (!config()) return json(res, 200, { ready: false, reason: "Falta conectar Supabase en Vercel." });
  try {
    await sb("bitacora_notes?select=day&limit=1");
    json(res, 200, { ready: true, loggedIn: !!sessionUser(req) });
  } catch (e) {
    console.error(e);
    const reason = /supabase 401/.test(e.message)
      ? "Supabase rechazó la llave secreta. Revisa SUPABASE_SECRET_KEY en Vercel."
      : "Faltan las tablas en Supabase.";
    json(res, 200, { ready: false, reason });
  }
}
