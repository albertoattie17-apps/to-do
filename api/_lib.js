// Utilidades compartidas por las funciones de /api (Vercel no publica archivos que empiezan con _).
import { createHmac, timingSafeEqual } from "node:crypto";

const MONTH = 60 * 60 * 24 * 30;

export function config() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "").replace(/\s+/g, "");
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

function headers(key) {
  const h = { apikey: key, "content-type": "application/json" };
  // las llaves nuevas (sb_secret_…) van solo en apikey; las antiguas (JWT) también como Bearer
  if (key.startsWith("eyJ")) h.authorization = `Bearer ${key}`;
  return h;
}

// Llamada a la API REST de Supabase con la llave de servidor (nunca llega al navegador).
export async function sb(path, { method = "GET", body, prefer } = {}) {
  const c = config();
  if (!c) throw new Error("config");
  const h = headers(c.key);
  if (prefer) h.prefer = prefer;
  const r = await fetch(`${c.url}/rest/v1/${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// ---------- usuarios (Supabase Auth: se crean en Authentication → Users) ----------
// Sin "@" se toma como usuario corto: "alberto" → "alberto@bitacora.app".
export const toEmail = (u) => {
  const s = String(u || "").trim().toLowerCase();
  return s.includes("@") ? s : `${s}@bitacora.app`;
};

// Devuelve el correo del usuario si la contraseña es correcta, o null si no.
export async function signIn(email, password) {
  const c = config();
  if (!c) throw new Error("config");
  const r = await fetch(`${c.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: headers(c.key),
    body: JSON.stringify({ email, password }),
  });
  if (r.status === 400 || r.status === 401 || r.status === 422) return null;
  if (!r.ok) throw new Error(`supabase auth ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return (data.user?.email || email).toLowerCase();
}

// ---------- sesión (cookie firmada: <correo en base64url>.<vence>.<firma>) ----------
export const secret = () => process.env.SESSION_SECRET || config()?.key || "";
const sign = (payload) => createHmac("sha256", secret()).update(payload).digest("hex");

export function makeSession(email) {
  const payload = `${Buffer.from(email).toString("base64url")}.${Date.now() + MONTH * 1000}`;
  return `${payload}.${sign(payload)}`;
}
export function sessionUser(req) {
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)bitacora_session=([^;]+)/);
  if (!m || !secret()) return null;
  const [id, exp, sig] = m[1].split(".");
  if (!id || !exp || !sig || Number(exp) < Date.now()) return null;
  const good = Buffer.from(sign(`${id}.${exp}`)), got = Buffer.from(sig);
  if (good.length !== got.length || !timingSafeEqual(good, got)) return null;
  const email = Buffer.from(id, "base64url").toString();
  return email.includes("@") ? email : null; // las sesiones del login anterior ya no valen
}
export function setSession(res, token) {
  res.setHeader("Set-Cookie", `bitacora_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${token ? MONTH : 0}`);
}

export function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(data));
}
