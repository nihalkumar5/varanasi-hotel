const { isAuthenticatedRequest, isAuthConfigured } = require("../admin-auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
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

  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({
      ok: false,
      error: "Admin login required."
    });
    return;
  }

  const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";
  const requestTimeoutMs = 10_000;

  function buildWebhookError(statusCode, bodyText) {
    const text = String(bodyText || "").replace(/\s+/g, " ").trim();

    if (!text) {
      return `Google Sheets webhook returned ${statusCode}.`;
    }

    if (/<html|docs\.google\.com|drive\.google\.com/i.test(text)) {
      return [
        `Google Sheets webhook returned ${statusCode} with an HTML page instead of JSON.`,
        "This usually means the URL is not a deployed Apps Script web app, the deployment is private, or the URL is not the /exec endpoint."
      ].join(" ");
    }

    return `Google Sheets webhook returned ${statusCode}. ${text.slice(0, 240)}`.trim();
  }

  async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  try {
    const webhookResponse = await fetchWithTimeout(`${sheetsWebhookUrl}?action=list`);
    const payload = await webhookResponse.json().catch(() => ({ ok: false }));

    if (!webhookResponse.ok || payload.ok === false) {
      res.status(502).json({
        ok: false,
        error: payload.error || buildWebhookError(webhookResponse.status)
      });
      return;
    }

    res.status(200).json({
      ok: true,
      leads: payload.leads || []
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error?.message || "Could not load the leads."
    });
  }
};
