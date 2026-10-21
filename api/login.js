// Entrar con un usuario creado en Supabase → Authentication → Users.
import { signIn, toEmail, makeSession, setSession, json } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Método no permitido." });
  const { username, password } = req.body || {};
  const u = String(username || "").trim();
  const p = String(password || "");
  if (u.length < 4 || p.length < 4) return json(res, 400, { error: "Usuario y contraseña necesitan mínimo 4 caracteres." });

  try {
    const email = await signIn(toEmail(u), p);
    if (!email) return json(res, 401, { error: "Usuario o contraseña incorrectos." });
    setSession(res, makeSession(email));
    json(res, 200, { ok: true });
  } catch (e) {
    console.error(e);
    json(res, 500, { error: "No se pudo conectar con Supabase. Intenta de nuevo." });
  }
}
