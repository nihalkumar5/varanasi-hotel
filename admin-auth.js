const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const COOKIE_NAME = "vnexora_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || "dev-vnexora-admin-secret-change-me";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 0) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      return;
    }

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
}

function isAuthConfigured() {
  return Boolean(ADMIN_PASSWORD);
}

function createSessionToken() {
  const payload = {
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    username: ADMIN_USERNAME
  };
  const payloadText = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadText);
  return `${payloadText}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadText, signature] = parts;
  const expectedSignature = sign(payloadText);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadText));
    if (!payload || payload.username !== ADMIN_USERNAME) {
      return false;
    }

    return Number(payload.exp) > Date.now();
  } catch (error) {
    return false;
  }
}

function isAuthenticatedRequest(request) {
  const cookies = parseCookies(request.headers?.cookie || "");
  return verifySessionToken(cookies[COOKIE_NAME]);
}

function buildSessionCookie() {
  const token = createSessionToken();
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    isSecureTransport() ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function buildClearedCookie() {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    isSecureTransport() ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function authenticateCredentials(username, password) {
  if (!isAuthConfigured()) {
    return false;
  }

  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((accumulator, entry) => {
      const separatorIndex = entry.indexOf("=");
      if (separatorIndex < 0) {
        return accumulator;
      }

      const name = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      accumulator[name] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function challenge(response, message) {
  response.writeHead(401, {
    "Content-Type": "text/plain; charset=utf-8",
    "WWW-Authenticate": 'Basic realm="Vnexora Admin", charset="UTF-8"'
  });
  response.end(message || "Authentication required.");
}

function verifyBasicHeader(authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith("Basic ")) {
    return false;
  }

  try {
    const raw = Buffer.from(authorizationHeader.slice(6), "base64").toString("utf8");
    const separatorIndex = raw.indexOf(":");
    if (separatorIndex < 0) {
      return false;
    }

    const username = raw.slice(0, separatorIndex);
    const password = raw.slice(separatorIndex + 1);
    return authenticateCredentials(username, password);
  } catch (error) {
    return false;
  }
}

function normalizeLoginBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body || "{}");
    } catch (error) {
      return {};
    }
  }

  return body;
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  return crypto.createHmac("sha256", ADMIN_AUTH_SECRET).update(value).digest("base64url");
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isSecureTransport() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

module.exports = {
  ADMIN_USERNAME,
  authenticateCredentials,
  buildClearedCookie,
  buildSessionCookie,
  challenge,
  isAuthenticatedRequest,
  isAuthConfigured,
  normalizeLoginBody,
  verifyBasicHeader
};
