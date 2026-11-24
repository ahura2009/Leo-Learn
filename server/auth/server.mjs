import { createServer } from "node:http";
import { AuthError } from "./errors.mjs";
import { loadConfig } from "./config.mjs";
import { openDatabase } from "./db.mjs";
import { createAuthService } from "./service.mjs";
import { createSmsSender } from "./sms.mjs";

const MAX_BODY_BYTES = 16 * 1024;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX_REQUESTS = 120;

export function createAuthServer({ config, service, logger = console }) {
  const hits = new Map();

  function limited(ip) {
    const at = Date.now();
    const entry = hits.get(ip);
    if (!entry || at - entry.start > RATE_WINDOW_MS) {
      hits.set(ip, { start: at, count: 1 });
      return false;
    }
    entry.count += 1;
    return entry.count > RATE_MAX_REQUESTS;
  }

  const server = createServer(async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "local"}`);
    const ip = clientIp(req);

    res.setHeader("x-content-type-options", "nosniff");
    res.setHeader("referrer-policy", "no-referrer");
    res.setHeader("cache-control", "no-store");

    try {
      if (url.pathname.startsWith("/v1/") && !cors(req, res, config)) {
        sendJson(res, 403, { error: { code: "FORBIDDEN" } });
        return;
      }

      if (req.method === "OPTIONS") {
        res.writeHead(204, { "access-control-max-age": "600" });
        res.end();
        return;
      }

      if (ip && limited(ip)) {
        sendJson(res, 429, {
          error: { code: "RATE_LIMITED", retryAfterSeconds: 10 },
        });
        return;
      }

      await route({ req, res, url, config, service });
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.retryAfterSeconds !== undefined) {
          res.setHeader("retry-after", String(error.retryAfterSeconds));
        }
        sendJson(res, error.status, error.toJSON());
      } else {
        logger.error("[auth] unhandled", error);
        sendJson(res, 500, { error: { code: "SERVER_ERROR" } });
      }
    } finally {
      logger.info(
        `${req.method} ${url.pathname} → ${res.statusCode} (${Date.now() - started}ms)`,
      );
    }
  });

  return server;
}

async function route({ req, res, url, config, service }) {
  if (url.pathname === "/v1/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === "/v1/auth/session" && req.method === "GET") {
    const current = await service.session(readToken(req, config));
    if (!current) {
      sendJson(res, 401, { error: { code: "UNAUTHORIZED" } });
      return;
    }
    sendJson(res, 200, { user: current.user });
    return;
  }

  if (url.pathname === "/v1/auth/sign-up/start" && req.method === "POST") {
    const body = await readJson(req);
    sendJson(res, 201, { challenge: await service.signUpStart(body) });
    return;
  }

  if (url.pathname === "/v1/auth/sign-up/verify" && req.method === "POST") {
    const body = await readJson(req);
    const result = await service.signUpVerify(body);
    setSessionCookie(res, config, result.session);
    sendJson(res, 200, { user: result.user });
    return;
  }

  if (url.pathname === "/v1/auth/sign-in" && req.method === "POST") {
    const body = await readJson(req);
    const result = await service.signIn(body);
    setSessionCookie(res, config, result.session);
    sendJson(res, 200, { user: result.user });
    return;
  }

  if (url.pathname === "/v1/auth/sign-out" && req.method === "POST") {
    await service.signOut(readToken(req, config));
    clearSessionCookie(res, config);
    sendJson(res, 204, null);
    return;
  }

  if (url.pathname === "/v1/auth/challenges/resend" && req.method === "POST") {
    const body = await readJson(req);
    sendJson(res, 200, { challenge: await service.resend(body) });
    return;
  }

  if (url.pathname === "/v1/auth/password/forgot" && req.method === "POST") {
    const body = await readJson(req);
    sendJson(res, 200, { challenge: await service.forgotPassword(body) });
    return;
  }

  if (url.pathname === "/v1/auth/password/reset" && req.method === "POST") {
    const body = await readJson(req);
    const result = await service.resetPassword(body);
    setSessionCookie(res, config, result.session);
    sendJson(res, 200, { user: result.user });
    return;
  }

  if (url.pathname === "/v1/auth/profile" && req.method === "PATCH") {
    const current = await service.session(readToken(req, config));
    if (!current) {
      sendJson(res, 401, { error: { code: "UNAUTHORIZED" } });
      return;
    }
    const body = await readJson(req);
    const user = await service.updateProfile(current.user.id, body);
    sendJson(res, 200, { user });
    return;
  }

  sendJson(res, 404, { error: { code: "NOT_FOUND" } });
}

/* ---------- HTTP helpers ---------- */

function cors(req, res, config) {
  const origin = req.headers.origin;
  if (!origin) return true;

  if (!config.allowedOrigins.includes(origin)) return false;

  res.setHeader("access-control-allow-origin", origin);
  res.setHeader("access-control-allow-credentials", "true");
  res.setHeader("vary", "origin");
  res.setHeader(
    "access-control-allow-methods",
    "GET,POST,PATCH,OPTIONS",
  );
  res.setHeader(
    "access-control-allow-headers",
    "content-type,authorization",
  );
  return true;
}

function sendJson(res, status, body) {
  if (body === null) {
    res.writeHead(status);
    res.end();
    return;
  }

  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new AuthError("BAD_REQUEST", 413, { message: "body_too_large" }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new AuthError("BAD_REQUEST", 400, { message: "invalid_json" }));
      }
    });

    req.on("error", reject);
  });
}

function parseCookies(header) {
  const result = {};
  if (!header) return result;

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  }

  return result;
}

function readToken(req, config) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return parseCookies(req.headers.cookie)[config.session.cookieName] ?? null;
}

function cookieAttributes(config) {
  return [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    config.session.secure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

function setSessionCookie(res, config, session) {
  const maxAge = Math.max(
    0,
    Math.floor((session.expiresAt - Date.now()) / 1000),
  );
  res.setHeader(
    "set-cookie",
    `${config.session.cookieName}=${encodeURIComponent(
      session.token,
    )}; Max-Age=${maxAge}; ${cookieAttributes(config)}`,
  );
}

function clearSessionCookie(res, config) {
  res.setHeader(
    "set-cookie",
    `${config.session.cookieName}=; Max-Age=0; ${cookieAttributes(config)}`,
  );
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}
