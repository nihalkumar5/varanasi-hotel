module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
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

  if (!sheetsWebhookUrl) {
    res.status(503).json({
      ok: false,
      error:
        "Google Sheets webhook is not configured. Set GOOGLE_SHEETS_WEBHOOK_URL to your Apps Script web app URL."
    });
    return;
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

  const lead = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

  if (!lead.hotelName || !lead.phone || !lead.email) {
    res.status(400).json({
      ok: false,
      error: "Hotel name, phone, and email are required."
    });
    return;
  }

  try {
    const webhookResponse = await fetchWithTimeout(sheetsWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...lead,
        source: "vnexora-hotel-audit",
        submittedAt: new Date().toISOString()
      })
    });

    if (!webhookResponse.ok) {
      const details = await webhookResponse.text().catch(() => "");
      res.status(502).json({
        ok: false,
        error: buildWebhookError(webhookResponse.status, details)
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error?.message || "Could not save the lead."
    });
  }
};
