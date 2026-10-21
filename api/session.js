// Dice a la pantalla de login si ya existe la cuenta (entrar) o si hay que crearla.
import { config, sb, sessionUser, json } from "./_lib.js";

export default async function handler(req, res) {
  if (!config()) return json(res, 200, { ready: false, reason: "Falta conectar Supabase en Vercel." });
  try {
    const users = await sb("bitacora_users?select=id&limit=1");
    json(res, 200, { ready: true, hasUser: users.length > 0, loggedIn: !!sessionUser(req) });
  } catch (e) {
    json(res, 200, { ready: false, reason: "Faltan las tablas en Supabase." });
  }
}
