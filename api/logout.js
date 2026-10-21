import { setSession } from "./_lib.js";

export default function handler(req, res) {
  setSession(res, "");
  res.writeHead(303, { Location: "/login.html" });
  res.end();
}
