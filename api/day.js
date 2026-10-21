// Leer (GET ?from=AAAA-MM-DD&to=AAAA-MM-DD) y guardar (PUT {date, data}) los días del usuario con sesión.
import { sb, sessionUser, json } from "./_lib.js";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  const uid = sessionUser(req);
  if (!uid) return json(res, 401, { error: "Inicia sesión." });

  try {
    if (req.method === "GET") {
      const { from, to } = req.query;
      if (!DATE.test(from || "") || !DATE.test(to || "")) return json(res, 400, { error: "Fechas inválidas." });
      const rows = await sb(`bitacora_days?select=day,data&user_id=eq.${uid}&day=gte.${from}&day=lte.${to}`);
      const days = {};
      for (const r of rows) days[r.day] = r.data;
      return json(res, 200, { days });
    }

    if (req.method === "PUT") {
      const { date, data } = req.body || {};
      if (!DATE.test(date || "") || !data || typeof data !== "object" || Array.isArray(data)) return json(res, 400, { error: "Datos inválidos." });
      if (JSON.stringify(data).length > 200_000) return json(res, 413, { error: "Este día tiene demasiado contenido." });
      await sb("bitacora_days?on_conflict=user_id,day", {
        method: "POST",
        body: { user_id: uid, day: date, data, updated_at: new Date().toISOString() },
        prefer: "resolution=merge-duplicates,return=minimal",
      });
      return json(res, 200, { ok: true });
    }

    json(res, 405, { error: "Método no permitido." });
  } catch (e) {
    console.error(e);
    json(res, 500, { error: "No se pudo conectar con Supabase." });
  }
}
