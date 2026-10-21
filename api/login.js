// Crear la cuenta (solo si todavía no existe ninguna) o entrar con usuario y contraseña.
import { sb, hashPassword, checkPassword, makeSession, setSession, json } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Método no permitido." });
  const { mode, username, password } = req.body || {};
  const u = String(username || "").trim();
  const p = String(password || "");
  if (u.length < 4 || p.length < 4) return json(res, 400, { error: "Usuario y contraseña necesitan mínimo 4 caracteres." });
  if (u.length > 60 || p.length > 200) return json(res, 400, { error: "Usuario o contraseña demasiado largos." });

  try {
    if (mode === "signup") {
      const existing = await sb("bitacora_users?select=id&limit=1");
      if (existing.length) return json(res, 403, { error: "Ya existe una cuenta. Entra con tu usuario." });
      const [user] = await sb("bitacora_users", {
        method: "POST",
        body: { username: u, pass_hash: hashPassword(p) },
        prefer: "return=representation",
      });
      setSession(res, makeSession(user.id));
      return json(res, 200, { ok: true });
    }

    const [user] = await sb(`bitacora_users?select=id,pass_hash&username=eq.${encodeURIComponent(u)}&limit=1`);
    if (!user || !checkPassword(p, user.pass_hash)) return json(res, 401, { error: "Usuario o contraseña incorrectos." });
    setSession(res, makeSession(user.id));
    json(res, 200, { ok: true });
  } catch (e) {
    console.error(e);
    json(res, 500, { error: "No se pudo conectar con Supabase. Intenta de nuevo." });
  }
}
