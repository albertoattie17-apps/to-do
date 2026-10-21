export default function handler(req, res) {
  res.writeHead(303, {
    "Set-Cookie": "bitacora_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    Location: "/login.html",
  });
  res.end();
}
