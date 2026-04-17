const { buildClearedCookie } = require("../../admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  res.setHeader("Set-Cookie", buildClearedCookie());
  res.status(200).json({ ok: true });
};
