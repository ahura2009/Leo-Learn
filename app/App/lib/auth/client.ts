import type { Goal, Level } from "../types";
import {
  AuthApiError,
  type AuthErrorCode,
  type AuthUser,
  type Challenge,
} from "./types";

/* کلاینت احراز هویت — همهٔ درخواست‌ها به بک‌اند واقعی می‌روند.
   نشست کوکی HttpOnly است و در JS خوانده نمی‌شود؛ پس هیچ توکنی
   در localStorage نمی‌نشیند. بدون تنظیم آدرس، هیچ جریانی شبیه‌سازی
   نمی‌شود و خطای صریح «تنظیم نشده» برمی‌گردد. */

const configuredBase = (process.env.NEXT_PUBLIC_AUTH_API_URL ?? "").trim();

/* export استاتیک (این ریپو با basePath فعالش می‌کند) هیچ سروری ندارد؛
   پس فقط با URL صریح auth کار می‌کند. در اجرای سروری/توسعه، /v1
   از مسیر rewrite به سرور auth می‌رسد. */
const staticExport = Boolean(process.env.NEXT_PUBLIC_BASE_PATH);
const fallbackBase = staticExport ? "" : "/v1";
const baseUrl = (configuredBase || fallbackBase).replace(/\/+$/, "");

export const authServiceConfigured = baseUrl.length > 0;

const REQUEST_TIMEOUT_MS = 15_000;

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
    retryAfterSeconds?: number;
    attemptsLeft?: number;
  };
};

const knownCodes: AuthErrorCode[] = [
  "NOT_CONFIGURED",
  "NETWORK",
  "UNAVAILABLE",
  "BAD_REQUEST",
  "PHONE_INVALID",
  "PHONE_TAKEN",
  "PASSWORD_INVALID",
  "CODE_INVALID",
  "CODE_EXPIRED",
  "TOO_MANY_ATTEMPTS",
  "RATE_LIMITED",
  "CHALLENGE_NOT_FOUND",
  "INVALID_CREDENTIALS",
  "ACCOUNT_LOCKED",
  "SERVER_ERROR",
  "UNKNOWN",
];

function errorFrom(status: number, body: ErrorBody | null): AuthApiError {
  const raw = body?.error;
  const code = knownCodes.includes(raw?.code as AuthErrorCode)
    ? (raw?.code as AuthErrorCode)
    : status === 429
      ? "RATE_LIMITED"
      : status >= 500
        ? "SERVER_ERROR"
        : "UNKNOWN";

  return new AuthApiError(code, status, {
    retryAfterSeconds: raw?.retryAfterSeconds,
    attemptsLeft: raw?.attemptsLeft,
    message: raw?.message,
  });
}

async function request<T>(
  path: string,
  init: { method: "GET" | "POST" | "PATCH"; body?: unknown } = {
    method: "GET",
  },
): Promise<T> {
  if (!authServiceConfigured) {
    throw new AuthApiError("NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: init.method,
      credentials: "include",
      headers:
        init.body === undefined ? { accept: "application/json" } : {
          accept: "application/json",
          "content-type": "application/json",
        },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
    });

    if (response.status === 204) return undefined as T;

    const body = (await response.json().catch(() => null)) as
      | (ErrorBody & Record<string, unknown>)
      | null;

    if (!response.ok) throw errorFrom(response.status, body);
    return body as T;
  } catch (error) {
    if (error instanceof AuthApiError) throw error;
    throw new AuthApiError("NETWORK");
  } finally {
    clearTimeout(timer);
  }
}

type UserResponse = { user: AuthUser };
type ChallengeResponse = { challenge: Challenge };

export const authApi = {
  /** کاربر جاری از روی کوکی نشست؛ null یعنی مهمان. */
  async session(): Promise<AuthUser | null> {
    try {
      const result = await request<UserResponse>("/auth/session");
      return result.user;
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) return null;
      throw error;
    }
  },

  async startSignUp(input: {
    name: string;
    phone: string;
    password: string;
  }): Promise<Challenge> {
    const result = await request<ChallengeResponse>("/auth/sign-up/start", {
      method: "POST",
      body: input,
    });
    return result.challenge;
  },

  async verifySignUp(input: {
    challengeId: string;
    code: string;
  }): Promise<AuthUser> {
    const result = await request<UserResponse>("/auth/sign-up/verify", {
      method: "POST",
      body: input,
    });
    return result.user;
  },

  async signIn(input: { phone: string; password: string }): Promise<AuthUser> {
    const result = await request<UserResponse>("/auth/sign-in", {
      method: "POST",
      body: input,
    });
    return result.user;
  },

  async signOut(): Promise<void> {
    await request<void>("/auth/sign-out", { method: "POST" });
  },

  async resend(challengeId: string): Promise<Challenge> {
    const result = await request<ChallengeResponse>("/auth/challenges/resend", {
      method: "POST",
      body: { challengeId },
    });
    return result.challenge;
  },

  async forgotPassword(phone: string): Promise<Challenge> {
    const result = await request<ChallengeResponse>("/auth/password/forgot", {
      method: "POST",
      body: { phone },
    });
    return result.challenge;
  },

  async resetPassword(input: {
    challengeId: string;
    code: string;
    password: string;
  }): Promise<AuthUser> {
    const result = await request<UserResponse>("/auth/password/reset", {
      method: "POST",
      body: input,
    });
    return result.user;
  },

  async updateProfile(input: {
    name?: string;
    level?: Level;
    goal?: Goal;
  }): Promise<AuthUser> {
    const result = await request<UserResponse>("/auth/profile", {
      method: "PATCH",
      body: input,
    });
    return result.user;
  },
};
