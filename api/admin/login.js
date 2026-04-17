const {
  ADMIN_USERNAME,
  authenticateCredentials,
  buildSessionCookie,
  isAuthConfigured,
  normalizeLoginBody
} = require("../../admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  if (!isAuthConfigured()) {
    res.status(503).json({
      ok: false,
      error: "Admin authentication is not configured. Set ADMIN_PASSWORD in the environment."
    });
    return;
  }

  const body = normalizeLoginBody(req.body);
  const username = String(body.username || ADMIN_USERNAME).trim();
  const password = String(body.password || "").trim();

  if (!password) {
    res.status(400).json({ ok: false, error: "Password is required." });
    return;
  }

  if (!authenticateCredentials(username, password)) {
    res.status(401).json({ ok: false, error: "Invalid admin credentials." });
    return;
  }

  res.setHeader("Set-Cookie", buildSessionCookie());
  res.status(200).json({ ok: true });
};
