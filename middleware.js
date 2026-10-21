// Protege las páginas: sin una sesión válida (cookie firmada por /api/login), manda a /login.html.
// Las funciones de /api revisan la sesión por su cuenta.

const PUBLIC = ["/login.html", "/favicon.ico"];

function secret() {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
}

async function hmac(key, text) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function validSession(cookieHeader) {
  const m = (cookieHeader || "").match(/(?:^|;\s*)bitacora_session=([^;]+)/);
  const key = secret();
  if (!m || !key) return false;
  const [id, exp, sig] = m[1].split(".");
  if (!id || !exp || !sig || Number(exp) < Date.now()) return false;
  return (await hmac(key, `${id}.${exp}`)) === sig;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  if (PUBLIC.includes(url.pathname) || url.pathname.startsWith("/api/")) return;
  if (await validSession(request.headers.get("cookie"))) return;
  return Response.redirect(new URL("/login.html", url), 302);
}
