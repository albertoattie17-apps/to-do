// Utilidades compartidas por las funciones de /api (Vercel no publica archivos que empiezan con _).
import { createHmac, scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const MONTH = 60 * 60 * 24 * 30;

export function config() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "").replace(/\s+/g, "");
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

// Llamada a la API REST de Supabase con la llave de servidor (nunca llega al navegador).
export async function sb(path, { method = "GET", body, prefer } = {}) {
  const c = config();
  if (!c) throw new Error("config");
  const headers = { apikey: c.key, "content-type": "application/json" };
  // las llaves nuevas (sb_secret_…) van solo en apikey; las antiguas (JWT) también como Bearer
  if (c.key.startsWith("eyJ")) headers.authorization = `Bearer ${c.key}`;
  if (prefer) headers.prefer = prefer;
  const r = await fetch(`${c.url}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// ---------- contraseñas ----------
export function hashPassword(pass) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pass, salt, 64).toString("hex")}`;
}
export function checkPassword(pass, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const a = scryptSync(pass, salt, 64), b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------- sesión (cookie firmada: <userId>.<vence>.<firma>) ----------
export const secret = () => process.env.SESSION_SECRET || config()?.key || "";
const sign = (payload) => createHmac("sha256", secret()).update(payload).digest("hex");

export function makeSession(userId) {
  const payload = `${userId}.${Date.now() + MONTH * 1000}`;
  return `${payload}.${sign(payload)}`;
}
export function sessionUser(req) {
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)bitacora_session=([^;]+)/);
  if (!m || !secret()) return null;
  const [id, exp, sig] = m[1].split(".");
  if (!id || !exp || !sig || Number(exp) < Date.now()) return null;
  const good = Buffer.from(sign(`${id}.${exp}`)), got = Buffer.from(sig);
  return good.length === got.length && timingSafeEqual(good, got) ? id : null;
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
