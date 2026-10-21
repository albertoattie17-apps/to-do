// Protege todo el sitio: sin la cookie de sesión correcta, manda a /login.html.
// El usuario y la contraseña viven en las variables de entorno AUTH_USER y AUTH_PASS de Vercel.

const PUBLIC = ["/login.html", "/api/login", "/api/logout", "/favicon.ico"];

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(header, name) {
  for (const part of (header || "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  if (PUBLIC.includes(url.pathname)) return;

  const user = process.env.AUTH_USER || "";
  const pass = process.env.AUTH_PASS || "";
  if (user.length < 4 || pass.length < 4) {
    return new Response("Falta configurar AUTH_USER y AUTH_PASS (mínimo 4 caracteres) en Vercel.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const expected = await sha256(`${user}:${pass}:bitacora`);
  if (readCookie(request.headers.get("cookie"), "bitacora_session") === expected) return;

  return Response.redirect(new URL("/login.html", url), 302);
}
