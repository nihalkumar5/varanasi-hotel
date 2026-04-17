const http = require("http");
const fs = require("fs");
const path = require("path");
const {
  ADMIN_USERNAME,
  buildClearedCookie,
  buildSessionCookie,
  isAuthConfigured,
  isAuthenticatedRequest,
  normalizeLoginBody,
  authenticateCredentials
} = require("./admin-auth");

const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";
const publicDir = path.join(__dirname, "public");
const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";
const requestTimeoutMs = 10_000;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};

const pageAliases = {
  "/": "/index.html",
  "/assessment": "/assessment.html",
  "/results": "/results.html",
  "/thank-you": "/thank-you.html",
  "/admin": "/admin.html"
};

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  response.end(JSON.stringify(body));
}

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

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(raw));
    request.on("error", reject);
  });
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

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);

  if (request.method === "GET" && requestUrl.pathname === "/api/admin/session") {
    if (!isAuthConfigured()) {
      sendJson(response, 503, {
        ok: false,
        authenticated: false,
        error: "Admin authentication is not configured. Set ADMIN_PASSWORD in the environment."
      });
      return;
    }

    if (!isAuthenticatedRequest(request)) {
      sendJson(response, 401, { ok: false, authenticated: false });
      return;
    }

    sendJson(response, 200, {
      ok: true,
      authenticated: true,
      username: ADMIN_USERNAME
    });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/admin/login") {
    try {
      if (!isAuthConfigured()) {
        sendJson(response, 503, {
          ok: false,
          error: "Admin authentication is not configured. Set ADMIN_PASSWORD in the environment."
        });
        return;
      }

      const body = normalizeLoginBody(await readRequestBody(request));
      const username = String(body.username || ADMIN_USERNAME).trim();
      const password = String(body.password || "").trim();

      if (!password) {
        sendJson(response, 400, { ok: false, error: "Password is required." });
        return;
      }

      if (!authenticateCredentials(username, password)) {
        sendJson(response, 401, { ok: false, error: "Invalid admin credentials." });
        return;
      }

      sendJson(
        response,
        200,
        { ok: true },
        {
          "Set-Cookie": buildSessionCookie()
        }
      );
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error.message || "Could not sign in."
      });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/admin/logout") {
    sendJson(
      response,
      200,
      { ok: true },
      {
        "Set-Cookie": buildClearedCookie()
      }
    );
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/lead") {
    try {
      const rawBody = await readRequestBody(request);
      const lead = JSON.parse(rawBody || "{}");

      if (!lead.hotelName || !lead.phone || !lead.email) {
        sendJson(response, 400, {
          ok: false,
          error: "Hotel name, phone, and email are required."
        });
        return;
      }

      if (!sheetsWebhookUrl) {
        sendJson(response, 503, {
          ok: false,
          error:
            "Google Sheets webhook is not configured. Set GOOGLE_SHEETS_WEBHOOK_URL to your Apps Script web app URL."
        });
        return;
      }

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
        sendJson(response, 502, {
          ok: false,
          error: buildWebhookError(webhookResponse.status, details)
        });
        return;
      }

      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error.message || "Could not save the lead."
      });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/leads") {
    try {
      if (!isAuthConfigured()) {
        sendJson(response, 503, {
          ok: false,
          error:
            "Admin authentication is not configured. Set ADMIN_PASSWORD in the environment."
        });
        return;
      }

      if (!isAuthenticatedRequest(request)) {
        sendJson(response, 401, {
          ok: false,
          error: "Admin login required."
        });
        return;
      }

      if (!sheetsWebhookUrl) {
        sendJson(response, 503, {
          ok: false,
          error:
            "Google Sheets webhook is not configured. Set GOOGLE_SHEETS_WEBHOOK_URL to your Apps Script web app URL."
        });
        return;
      }

      const webhookResponse = await fetchWithTimeout(`${sheetsWebhookUrl}?action=list`);
      const payload = await webhookResponse.json().catch(() => ({ ok: false }));

      if (!webhookResponse.ok || payload.ok === false) {
        sendJson(response, 502, {
          ok: false,
          error: payload.error || buildWebhookError(webhookResponse.status)
        });
        return;
      }

      sendJson(response, 200, {
        ok: true,
        leads: payload.leads || []
      });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error.message || "Could not load the leads."
      });
    }
    return;
  }

  let requestPath = pageAliases[requestUrl.pathname] || (requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
  if (
    (requestUrl.pathname === "/admin" ||
      requestUrl.pathname === "/admin.html" ||
      requestUrl.pathname === "/results" ||
      requestUrl.pathname === "/results.html") &&
    !isAuthenticatedRequest(request)
  ) {
    requestPath = "/admin-login.html";
  }
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }

      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Internal server error");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream"
    });
    response.end(content);
  });
});

server.listen(port, host, () => {
  console.log(`Hotel audit app running at http://${host}:${port}`);
});
