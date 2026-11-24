import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));

/* همهٔ تنظیمات از محیط خوانده می‌شوند؛ هیچ راز یا کلیدی در کد نیست. */
export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  const sessionSecret = (env.AUTH_SESSION_SECRET ?? "").trim();
  const smsProvider = (env.AUTH_SMS_PROVIDER ?? "console").trim();

  const config = {
    production,
    host: env.AUTH_HOST ?? "127.0.0.1",
    port: Number(env.AUTH_PORT ?? 8787),
    dbPath: env.AUTH_DB_PATH ?? join(here, "data", "auth.sqlite"),
    sessionSecret,
    allowedOrigins: (env.AUTH_ALLOWED_ORIGINS ??
      "http://localhost:3000,http://127.0.0.1:3000")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    sms: {
      provider: smsProvider,
      kavenegarApiKey: env.KAVENEGAR_API_KEY ?? "",
      kavenegarTemplate: env.KAVENEGAR_OTP_TEMPLATE ?? "",
      kavenegarSender: env.KAVENEGAR_SENDER ?? "",
      webhookUrl: env.AUTH_SMS_WEBHOOK_URL ?? "",
      webhookToken: env.AUTH_SMS_WEBHOOK_TOKEN ?? "",
    },
    otp: {
      length: 6,
      ttlSeconds: Number(env.AUTH_OTP_TTL_SECONDS ?? 300),
      resendCooldownSeconds: Number(env.AUTH_OTP_RESEND_SECONDS ?? 60),
      maxAttempts: Number(env.AUTH_OTP_MAX_ATTEMPTS ?? 5),
    },
    session: {
      ttlDays: Number(env.AUTH_SESSION_DAYS ?? 30),
      cookieName: env.AUTH_COOKIE_NAME ?? "leo_auth",
      secure: env.AUTH_COOKIE_SECURE
        ? env.AUTH_COOKIE_SECURE === "true"
        : production,
    },
  };

  validateConfig(config);
  return config;
}

export function validateConfig(config) {
  if (!Number.isInteger(config.port) || config.port <= 0) {
    throw new Error("AUTH_PORT must be a positive integer");
  }

  if (config.sms.provider === "kavenegar") {
    if (!config.sms.kavenegarApiKey || !config.sms.kavenegarTemplate) {
      throw new Error(
        "KAVENEGAR_API_KEY and KAVENEGAR_OTP_TEMPLATE are required when AUTH_SMS_PROVIDER=kavenegar",
      );
    }
  } else if (config.sms.provider === "webhook") {
    if (!config.sms.webhookUrl) {
      throw new Error(
        "AUTH_SMS_WEBHOOK_URL is required when AUTH_SMS_PROVIDER=webhook",
      );
    }
  } else if (config.sms.provider === "console") {
    if (config.production) {
      throw new Error(
        "AUTH_SMS_PROVIDER=console is development-only. Configure Kavenegar or a webhook in production.",
      );
    }
  } else {
    throw new Error(`Unknown AUTH_SMS_PROVIDER: ${config.sms.provider}`);
  }

  if (config.production && config.sessionSecret.length < 32) {
    throw new Error(
      "AUTH_SESSION_SECRET (at least 32 characters) is required in production",
    );
  }

  if (config.allowedOrigins.length === 0) {
    throw new Error("AUTH_ALLOWED_ORIGINS must list at least one origin");
  }
}
