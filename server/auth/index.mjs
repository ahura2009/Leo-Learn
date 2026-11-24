import { randomBytes } from "node:crypto";
import { loadConfig } from "./config.mjs";
import { openDatabase, purgeExpired } from "./db.mjs";
import { createAuthService } from "./service.mjs";
import { createSmsSender } from "./sms.mjs";
import { createAuthServer } from "./server.mjs";

/* سرویس احراز هویت Leo Learn.
   اجرا: npm run auth:server  (یا node --env-file-if-exists=.env.local server/auth/index.mjs) */

const config = loadConfig();

if (!config.sessionSecret) {
  config.sessionSecret = randomBytes(32).toString("hex");
  console.warn(
    "[auth] AUTH_SESSION_SECRET not set — using an ephemeral secret. Sessions and OTPs reset on restart. Set it in production.",
  );
}

const db = openDatabase(config.dbPath);
const sms = createSmsSender(config.sms);
const service = createAuthService({ db, config, sms });
const server = createAuthServer({ config, service });

const cleanup = setInterval(() => {
  purgeExpired(db);
}, 60 * 60 * 1000);
cleanup.unref();

server.listen(config.port, config.host, () => {
  console.log(
    `[auth] listening on http://${config.host}:${config.port} (sms: ${config.sms.provider})`,
  );
});

function shutdown() {
  console.log("[auth] shutting down");
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
