// Cambiar la contraseña sin saber la actual, con el código RESET_CODE que solo el dueño guarda en Vercel.
// Las tareas no se tocan: solo se reemplaza el hash de la contraseña.
import { createHash, timingSafeEqual } from "node:crypto";
import { sb, hashPassword, makeSession, setSession, json } from "./_lib.js";

const digest = (t) => createHash("sha256").update(String(t)).digest();

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Método no permitido." });
  const expected = (process.env.RESET_CODE || "").trim();
  if (expected.length < 4) return json(res, 503, { error: "Primero guarda RESET_CODE en Vercel y vuelve a publicar." });

  const { code, password } = req.body || {};
  const p = String(password || "");
  if (!timingSafeEqual(digest(String(code || "").trim()), digest(expected))) {
    return json(res, 401, { error: "El código de recuperación no es correcto." });
  }
  if (p.length < 4 || p.length > 200) return json(res, 400, { error: "La contraseña nueva necesita mínimo 4 caracteres." });

  try {
    const [user] = await sb("bitacora_users?select=id,username&order=created_at.asc&limit=1");
    if (!user) return json(res, 404, { error: "Todavía no hay cuenta. Créala desde la pantalla de entrada." });
    await sb(`bitacora_users?id=eq.${user.id}`, { method: "PATCH", body: { pass_hash: hashPassword(p) }, prefer: "return=minimal" });
    setSession(res, makeSession(user.id));
    json(res, 200, { ok: true, username: user.username });
  } catch (e) {
    console.error(e);
    json(res, 500, { error: "No se pudo conectar con Supabase. Intenta de nuevo." });
  }
}
