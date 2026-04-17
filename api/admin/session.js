const { ADMIN_USERNAME, isAuthenticatedRequest, isAuthConfigured } = require("../../admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  if (!isAuthConfigured()) {
    res.status(503).json({
      ok: false,
      authenticated: false,
      error: "Admin authentication is not configured. Set ADMIN_PASSWORD in the environment."
    });
    return;
  }

  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ ok: false, authenticated: false });
    return;
  }

  res.status(200).json({
    ok: true,
    authenticated: true,
    username: ADMIN_USERNAME
  });
};
