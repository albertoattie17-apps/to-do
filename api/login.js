import { createHash, timingSafeEqual } from "node:crypto";

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

function same(a, b) {
  const x = Buffer.from(sha256(a)), y = Buffer.from(sha256(b));
  return timingSafeEqual(x, y);
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end();
  }
  const user = process.env.AUTH_USER || "";
  const pass = process.env.AUTH_PASS || "";
  const body = req.body || {};
  const u = String(body.username || "");
  const p = String(body.password || "");

  if (user.length < 4 || pass.length < 4) {
    res.writeHead(303, { Location: "/login.html?error=config" });
    return res.end();
  }
  if (u.length < 4 || p.length < 4 || !same(u, user) || !same(p, pass)) {
    res.writeHead(303, { Location: "/login.html?error=1" });
    return res.end();
  }

  const token = sha256(`${user}:${pass}:bitacora`);
  res.writeHead(303, {
    "Set-Cookie": `bitacora_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
    Location: "/",
  });
  res.end();
}
